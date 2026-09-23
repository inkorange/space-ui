/** Behaviour and markup for the charts. Geometry — bar heights, arc angles,
 *  the crosshair — is checked in a browser; see charts.browser.test.tsx. */
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Chart } from "./Chart";
import { BarList } from "./BarList";
import { PieChart } from "./PieChart";

const PLANETS = ["Mercury", "Venus", "Earth"];
const MASS = [0.055, 0.815, 1];
const RADIUS = [0.383, 0.949, 1];

describe("Chart", () => {
  const two = [
    { name: "Mass", data: MASS },
    { name: "Radius", data: RADIUS },
  ];

  it("publishes its figures as a table, so a chart is never silent", () => {
    render(<Chart type="bar" categories={PLANETS} series={two} aria-label="Planet sizes" />);
    const table = screen.getByRole("table", { name: "Planet sizes" });
    expect(within(table).getByRole("columnheader", { name: "Mass" })).toBeInTheDocument();
    expect(within(table).getByRole("rowheader", { name: "Venus" })).toBeInTheDocument();
    expect(within(table).getAllByRole("row")).toHaveLength(PLANETS.length + 1);
  });

  it("writes a gap as a dash rather than as zero", () => {
    render(
      <Chart type="line" categories={PLANETS} series={[{ name: "Mass", data: [1, null, 3] }]} aria-label="With a gap" />,
    );
    expect(within(screen.getByRole("table")).getByText("—")).toBeInTheDocument();
  });

  it("shows a legend for two series and none for one", () => {
    // A name appears twice when there is a legend — once there, once as the
    // table's column header — and once when there is not.
    const { rerender } = render(<Chart type="bar" categories={PLANETS} series={two} aria-label="Two" />);
    expect(screen.getAllByText("Radius")).toHaveLength(2);

    rerender(<Chart type="bar" categories={PLANETS} series={[two[0]]} aria-label="One" />);
    expect(screen.getAllByText("Mass")).toHaveLength(1);
  });

  it("takes the legend as a prop either way", () => {
    const { rerender } = render(
      <Chart type="bar" categories={PLANETS} series={two} legend={false} aria-label="No legend" />,
    );
    expect(screen.getAllByText("Radius")).toHaveLength(1);

    rerender(<Chart type="bar" categories={PLANETS} series={[two[0]]} legend aria-label="Forced" />);
    expect(screen.getAllByText("Mass")).toHaveLength(2);
  });

  it("gives every series its own colour, in the palette's order", () => {
    const { container } = render(<Chart type="bar" categories={PLANETS} series={two} aria-label="Colours" />);
    const fills = [...container.querySelectorAll("path[fill]")].map((p) => p.getAttribute("fill"));
    expect(fills).toContain("var(--sp-chart-series-1-color)");
    expect(fills).toContain("var(--sp-chart-series-2-color)");
  });

  it("hatches the categories still being counted, and says so in the figures", () => {
    const { container } = render(
      <Chart
        type="bar"
        categories={["Mon", "Tue", "Wed"]}
        series={[{ name: "Builds", data: [142, 183, 30] }]}
        partialFrom={2}
        aria-label="Builds"
      />,
    );
    // The unfinished bar is painted with a pattern rather than the flat colour.
    const fills = [...container.querySelectorAll("path[fill]")].map((p) => p.getAttribute("fill"));
    expect(fills.filter((f) => f?.startsWith("url(#"))).toHaveLength(1);
    expect(container.querySelector("pattern")).not.toBeNull();
    expect(within(screen.getByRole("table")).getByText(/30 so far/)).toBeInTheDocument();
  });

  it("hatches nothing when the data is complete", () => {
    const { container } = render(
      <Chart type="bar" categories={PLANETS} series={[two[0]]} aria-label="Complete" />,
    );
    expect(container.querySelector("pattern")).toBeNull();
  });

  it("reports what was clicked", async () => {
    const user = userEvent.setup();
    const onPointClick = vi.fn();
    const { container } = render(
      <Chart type="bar" categories={PLANETS} series={two} onPointClick={onPointClick} aria-label="Clickable" />,
    );
    await user.click(container.querySelectorAll("path[fill]")[1]);
    expect(onPointClick).toHaveBeenCalledWith(
      expect.objectContaining({ series: "Mass", category: "Venus", value: 0.815, categoryIndex: 1 }),
    );
  });

  it("warns when there are more series than the palette can tell apart", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Chart
        type="bar"
        categories={["a"]}
        series={Array.from({ length: 9 }, (_, i) => ({ name: `S${i}`, data: [1] }))}
        aria-label="Too many"
      />,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("colours repeat"));
    warn.mockRestore();
  });

  it("warns when a series does not line up with the categories", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Chart type="bar" categories={PLANETS} series={[{ name: "Short", data: [1] }]} aria-label="Ragged" />,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("different number of values"));
    warn.mockRestore();
  });
});

describe("BarList", () => {
  const POLL = [
    { label: "Idea", value: 44 },
    { label: "Bug", value: 7 },
    { label: "Pain", value: 4 },
  ];

  it("is a labelled list of rows carrying their own figures", () => {
    render(<BarList items={POLL} aria-label="Poll results" />);
    const list = screen.getByRole("list", { name: "Poll results" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(within(list).getByText("44")).toBeInTheDocument();
  });

  it("measures every bar against the longest", () => {
    const { container } = render(<BarList items={POLL} aria-label="Poll" />);
    const widths = [...container.querySelectorAll("[class*='fill']")].map(
      (el) => (el as HTMLElement).style.width,
    );
    expect(widths[0]).toBe("100%");
    expect(widths[1]).toBe(`${(7 / 44) * 100}%`);
  });

  it("measures against a given total instead, when that is the point", () => {
    const { container } = render(<BarList items={POLL} max={100} aria-label="Poll" />);
    const first = container.querySelector("[class*='fill']") as HTMLElement;
    expect(first.style.width).toBe("44%");
  });

  it("shows each row's share when asked", () => {
    render(<BarList items={POLL} showPercent aria-label="Poll" />);
    // 44 of 55.
    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("is plain text until a click handler makes it pressable", async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();
    const { rerender } = render(<BarList items={POLL} aria-label="Poll" />);
    expect(screen.queryByRole("button")).toBeNull();

    rerender(<BarList items={POLL} onItemClick={onItemClick} aria-label="Poll" />);
    await user.click(screen.getByRole("button", { name: /Bug/ }));
    expect(onItemClick).toHaveBeenCalledWith({ label: "Bug", value: 7 }, 1);
  });

  it("draws a zero row as a row with nothing in it", () => {
    const { container } = render(
      <BarList items={[{ label: "None", value: 0 }]} aria-label="Poll" />,
    );
    expect((container.querySelector("[class*='fill']") as HTMLElement).style.width).toBe("0%");
  });
});

describe("PieChart", () => {
  const SLICES = [
    { label: "Rocky", value: 128 },
    { label: "Gas giant", value: 96 },
    { label: "Ice giant", value: 41 },
  ];

  it("draws a slice each and names them all in the legend", () => {
    const { container } = render(<PieChart slices={SLICES} aria-label="Worlds by type" />);
    expect(container.querySelectorAll("path")).toHaveLength(3);
    expect(screen.getByText("Rocky")).toBeInTheDocument();
    expect(screen.getByText("Ice giant")).toBeInTheDocument();
  });

  it("gives each slice its share, so nothing rests on reading an angle", () => {
    render(<PieChart slices={SLICES} aria-label="Worlds" />);
    expect(screen.getByText("48%")).toBeInTheDocument();
  });

  it("puts the total in a donut's middle", () => {
    render(<PieChart donut label="worlds" slices={SLICES} aria-label="Worlds" />);
    expect(screen.getByText("265")).toBeInTheDocument();
    expect(screen.getByText("worlds")).toBeInTheDocument();
  });

  it("drops values a pie cannot show", () => {
    const { container } = render(
      <PieChart slices={[...SLICES, { label: "Impossible", value: -5 }]} aria-label="Worlds" />,
    );
    expect(container.querySelectorAll("path")).toHaveLength(3);
    expect(screen.queryByText("Impossible")).toBeNull();
  });

  it("draws a single slice as the whole circle", () => {
    const { container } = render(<PieChart slices={[{ label: "All", value: 9 }]} aria-label="One" />);
    expect(container.querySelectorAll("path")).toHaveLength(1);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("reports the slice that was clicked", async () => {
    const user = userEvent.setup();
    const onSliceClick = vi.fn();
    const { container } = render(
      <PieChart slices={SLICES} onSliceClick={onSliceClick} aria-label="Worlds" />,
    );
    await user.click(container.querySelectorAll("path")[1]);
    expect(onSliceClick).toHaveBeenCalledWith({ label: "Gas giant", value: 96 }, 1);
  });
});
