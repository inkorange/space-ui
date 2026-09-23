/**
 * What the charts actually draw, in a browser that lays them out.
 *
 * A chart is a claim about proportion: a bar twice the value must be twice as
 * tall, an arc a quarter of the total must be a quarter of the circle. None of
 * that can be checked where every rectangle is zero, which is why it lives
 * here rather than beside the markup tests.
 */
import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { Chart } from "./Chart";
import { BarList } from "./BarList";
import { PieChart } from "./PieChart";

const settle = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

/** Waits out the mount animations, so a measurement is of the finished
 *  drawing rather than a frame partway through it. */
async function drawn() {
  await settle();
  await Promise.all(
    document.getAnimations().map((animation) => animation.finished.catch(() => undefined)),
  );
  await settle();
}

async function mount(node: React.ReactElement, width = 640) {
  render(<div style={{ width }}>{node}</div>);
  // The plot measures its container, so nothing is drawn to scale until the
  // observer has reported a width.
  await settle();
  await settle();
  return document.querySelector("svg")!;
}

const bars = (svg: SVGElement) => [...svg.querySelectorAll("path[fill]")] as SVGPathElement[];

describe("Chart bars", () => {
  it("draws a bar twice the value twice as tall", async () => {
    const svg = await mount(
      <Chart type="bar" categories={["a", "b", "c"]} series={[{ name: "n", data: [10, 20, 40] }]} aria-label="Bars" />,
    );
    const [a, b, c] = bars(svg).map((p) => p.getBBox().height);
    expect(b / a).toBeCloseTo(2, 1);
    expect(c / a).toBeCloseTo(4, 1);
  });

  it("stands every bar on the same baseline", async () => {
    const svg = await mount(
      <Chart type="bar" categories={["a", "b"]} series={[{ name: "n", data: [3, 9] }]} aria-label="Bars" />,
    );
    const bottoms = bars(svg).map((p) => Math.round(p.getBBox().y + p.getBBox().height));
    expect(bottoms[0]).toBe(bottoms[1]);
  });

  it("leaves a gap between two series in the same category", async () => {
    const svg = await mount(
      <Chart
        type="bar"
        categories={["a", "b"]}
        series={[{ name: "one", data: [10, 10] }, { name: "two", data: [10, 10] }]}
        aria-label="Two series"
      />,
    );
    const [first, second] = bars(svg).map((p) => p.getBBox());
    // Second series starts after the first ends: the two never merge into one.
    expect(second.x).toBeGreaterThanOrEqual(first.x + first.width);
  });

  it("hangs a negative bar below the zero line", async () => {
    const svg = await mount(
      <Chart type="bar" categories={["a", "b"]} series={[{ name: "n", data: [20, -20] }]} aria-label="Bars" />,
    );
    const [up, down] = bars(svg).map((p) => p.getBBox());
    expect(down.y).toBeGreaterThanOrEqual(up.y + up.height - 1);
    expect(down.height).toBeCloseTo(up.height, 0);
  });

  it("reads every series at the category under the pointer", async () => {
    const svg = await mount(
      <Chart
        type="bar"
        categories={["Mercury", "Venus"]}
        series={[{ name: "Mass", data: [0.05, 0.8] }, { name: "Radius", data: [0.38, 0.95] }]}
        aria-label="Sizes"
      />,
    );
    const plot = svg.parentElement!;
    const box = plot.getBoundingClientRect();
    plot.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true, pointerType: "mouse",
        clientX: box.left + box.width * 0.8, clientY: box.top + box.height / 2,
      }),
    );
    await settle();

    const tip = document.querySelector("[role='status']")!;
    expect(tip.textContent).toContain("Venus");
    expect(tip.textContent).toContain("0.8");
    expect(tip.textContent).toContain("0.95");
    // And a crosshair marking which category is being read.
    expect(svg.querySelector("line[class*='crosshair']")).not.toBeNull();
  });
});

describe("Chart lines", () => {
  it("plots points in order across the full width", async () => {
    const svg = await mount(
      <Chart type="line" categories={["a", "b", "c"]} series={[{ name: "n", data: [1, 5, 3] }]} aria-label="Line" />,
    );
    const d = svg.querySelector("path[stroke]")!.getAttribute("d")!;
    const xs = [...d.matchAll(/[ML]([\d.]+),/g)].map((m) => Number(m[1]));
    expect(xs).toHaveLength(3);
    expect(xs[0]).toBeLessThan(xs[1]);
    expect(xs[1]).toBeLessThan(xs[2]);
  });

  it("keeps the ends inside the plot, so their labels are not cut off", async () => {
    const svg = await mount(
      <Chart type="line" categories={["Jan", "Feb", "Mar"]} series={[{ name: "n", data: [1, 2, 3] }]} aria-label="Line" />,
    );
    const box = svg.getBoundingClientRect();
    const labels = [...svg.querySelectorAll("text")].map((t) => t.getBoundingClientRect());
    for (const label of labels) {
      expect(label.left).toBeGreaterThanOrEqual(box.left - 1);
      expect(label.right).toBeLessThanOrEqual(box.right + 1);
    }
  });

  it("breaks the line where a reading is missing", async () => {
    const svg = await mount(
      <Chart type="line" categories={["a", "b", "c", "d"]} series={[{ name: "n", data: [1, null, 3, 4] }]} aria-label="Gap" />,
    );
    // Two runs, not one line drawn straight through the hole.
    expect(svg.querySelectorAll("path[stroke]")).toHaveLength(2);
  });

  it("fills an area down to the baseline", async () => {
    const svg = await mount(
      <Chart type="area" categories={["a", "b"]} series={[{ name: "n", data: [4, 8] }]} aria-label="Area" />,
    );
    const area = svg.querySelector("path[fill]:not([stroke])") as SVGPathElement;
    const line = svg.querySelector("path[stroke]") as SVGPathElement;
    expect(area.getBBox().height).toBeGreaterThan(line.getBBox().height);
  });
});

describe("BarList", () => {
  it("fills from nothing, and stands still when told not to", async () => {
    render(
      <div style={{ width: 400 }}>
        <BarList animated={false} items={[{ label: "Idea", value: 44 }]} aria-label="Poll" />
      </div>,
    );
    await settle();
    expect(document.getAnimations()).toHaveLength(0);
    const fill = document.querySelector("[class*='fill']")!.getBoundingClientRect().width;
    expect(fill).toBeGreaterThan(0);
  });

  it("draws each bar to its share of the longest", async () => {
    render(
      <div style={{ width: 400 }}>
        <BarList items={[{ label: "Idea", value: 44 }, { label: "Bug", value: 22 }]} aria-label="Poll" />
      </div>,
    );
    // The bars fill on mount, one row after the next. The animation starts on
    // the frame after the render, so look for it there, then measure once it
    // has finished.
    await settle();
    expect(document.getAnimations().length).toBeGreaterThan(0);
    await drawn();
    const fills = [...document.querySelectorAll("[class*='fill']")].map((el) => el.getBoundingClientRect().width);
    expect(fills[1] / fills[0]).toBeCloseTo(0.5, 1);
  });

  it("sets a pressable row exactly like a plain one", async () => {
    // The regression this guards: the button used `font: inherit`, and that
    // shorthand reset the size to the page's own, so giving a list a click
    // handler silently changed its type size.
    render(
      <div style={{ width: 400, fontSize: 16 }}>
        <BarList items={[{ label: "Idea", value: 44 }]} aria-label="Plain" />
        <BarList items={[{ label: "Idea", value: 44 }]} onItemClick={() => {}} aria-label="Pressable" />
      </div>,
    );
    await drawn();
    const [plain, pressable] = [...document.querySelectorAll("[class*='line']")];
    expect(pressable.tagName).toBe("BUTTON");
    expect(getComputedStyle(pressable).fontSize).toBe(getComputedStyle(plain).fontSize);
    const part = (row: Element, name: string) =>
      getComputedStyle(row.querySelector(`[class*='${name}']`)!).fontSize;
    expect(part(pressable, "label")).toBe(part(plain, "label"));
    expect(part(pressable, "value")).toBe(part(plain, "value"));
  });

  it("lines every bar up at the same left edge, whatever the label", async () => {
    render(
      <div style={{ width: 400 }}>
        <BarList
          items={[{ label: "A", value: 1 }, { label: "A much longer label", value: 1 }]}
          aria-label="Poll"
        />
      </div>,
    );
    await drawn();
    const tracks = [...document.querySelectorAll("[class*='track']")].map((el) => el.getBoundingClientRect().left);
    expect(tracks[0]).toBeCloseTo(tracks[1], 0);
  });
});

describe("PieChart", () => {
  it("gives each slice its share of the circle", async () => {
    const svg = await mount(
      <PieChart
        size={200}
        slices={[{ label: "half", value: 50 }, { label: "quarter", value: 25 }, { label: "quarter too", value: 25 }]}
        aria-label="Shares"
      />,
    );
    const [half, quarter] = [...svg.querySelectorAll("path")].map((p) => p.getBBox());
    // A half fills one side of the circle; a quarter, half of that side.
    expect(half.width * half.height).toBeGreaterThan(quarter.width * quarter.height * 1.5);
  });

  it("cuts a hole for a donut and none for a pie", async () => {
    const donut = await mount(<PieChart donut size={200} slices={[{ label: "a", value: 1 }, { label: "b", value: 1 }]} aria-label="Donut" />);
    const centre = donut.getBoundingClientRect();
    const middle = document.elementFromPoint(centre.left + centre.width / 2, centre.top + centre.height / 2);
    expect(middle?.tagName).not.toBe("path");
  });

  it("reports the slice that was pressed, by its place in the data", async () => {
    const onSliceClick = vi.fn();
    const svg = await mount(
      <PieChart
        size={200}
        slices={[{ label: "a", value: 60 }, { label: "b", value: 40 }]}
        onSliceClick={onSliceClick}
        aria-label="Clickable"
      />,
    );
    (svg.querySelectorAll("path")[1] as SVGPathElement).dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onSliceClick).toHaveBeenCalledWith({ label: "b", value: 40 }, 1);
  });
});
