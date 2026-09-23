/**
 * Where the floating surfaces land, in a browser that lays them out.
 *
 * Each of these reads the trigger's box and the viewport to decide where to
 * sit, which way to flip, and how to stay on screen. happy-dom reports every
 * rectangle as zero, so none of it can be asked there.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { useState } from "react";
import { Select } from "./Select";
import { Autocomplete } from "./Autocomplete";
import { Popover } from "./Popover";
import { DropdownMenu } from "./DropdownMenu";
import { Tooltip } from "./Tooltip";
import { Button } from "./Button";

const settle = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

/** These surfaces glide into place as they appear, so a rectangle read on the
 *  next frame is a rectangle mid-reveal. Waits for it to stop moving. */
async function stillAt(el: () => Element | null): Promise<DOMRect> {
  let last = "";
  for (let i = 0; i < 120; i++) {
    await settle();
    const node = el();
    if (node) {
      const r = node.getBoundingClientRect();
      const key = `${r.top}|${r.left}|${r.width}`;
      if (key === last) return r;
      last = key;
    }
  }
  return el()!.getBoundingClientRect();
}

/** A trigger placed exactly where a test wants it in the viewport. */
const At = ({ top, left, children }: { top: number | string; left: number | string; children: React.ReactNode }) => (
  <div style={{ position: "fixed", top, left }}>{children}</div>
);

const rect = (el: Element | null) => el!.getBoundingClientRect();
const isTopLayer = (el: Element) => {
  const r = rect(el);
  const at = document.elementFromPoint(r.left + r.width / 2, r.top + 4);
  return at != null && (at === el || el.contains(at));
};

beforeEach(() => {
  document.body.style.margin = "0";
});

describe("Select panel placement", () => {
  const Stars = ({ top = 40, left = 40 }: { top?: number | string; left?: number | string }) => {
    const [value, setValue] = useState("G");
    return (
      <At top={top} left={left}>
        <Select value={value} onValueChange={setValue} aria-label="Star type">
          <Select.Item value="G">G — Yellow</Select.Item>
          <Select.Item value="K">K — Orange</Select.Item>
          <Select.Item value="M">M — Red dwarf</Select.Item>
        </Select>
      </At>
    );
  };
  const trigger = () => document.querySelector<HTMLButtonElement>("[aria-haspopup='listbox']")!;
  const panel = () => document.querySelector<HTMLElement>("[role='listbox']")!;

  it("hangs under the trigger, in the top layer", async () => {
    render(<Stars />);
    await settle();
    trigger().click();
    await settle();

    const r = await stillAt(panel);
    expect(panel().matches(":popover-open")).toBe(true);
    expect(getComputedStyle(panel()).position).toBe("fixed");
    // 4px under the trigger, and painted above everything at that point.
    expect(r.top - rect(trigger()).bottom).toBeCloseTo(4, 0);
    expect(isTopLayer(panel())).toBe(true);
  });

  it("is never narrower than the trigger it covers", async () => {
    render(<Stars />);
    await settle();
    trigger().click();
    await settle();
    expect(rect(panel()).width).toBeGreaterThanOrEqual(rect(trigger()).width - 1);
  });

  it("flips above when there is no room below", async () => {
    render(<Stars top="calc(100vh - 60px)" />);
    await settle();
    trigger().click();
    await settle();

    const r = await stillAt(panel);
    expect(panel().dataset.side).toBe("top");
    expect(r.bottom).toBeLessThanOrEqual(rect(trigger()).top + 1);
  });

  it("stays on screen at the right edge", async () => {
    render(<Stars left="calc(100vw - 80px)" />);
    await settle();
    trigger().click();
    await settle();
    expect(rect(panel()).right).toBeLessThanOrEqual(window.innerWidth);
  });

  it("escapes a container that clips its children", async () => {
    // The reported bug: inside anything with overflow hidden — a Dialog, a
    // card — the panel used to be trapped.
    render(
      <div style={{ position: "fixed", top: 40, left: 40, width: 200, height: 60, overflow: "hidden" }}>
        <Select value="G" onValueChange={() => {}} aria-label="Star type">
          <Select.Item value="G">G — Yellow</Select.Item>
          <Select.Item value="K">K — Orange</Select.Item>
        </Select>
      </div>,
    );
    await settle();
    trigger().click();
    await settle();

    const clipper = document.querySelector<HTMLElement>("[style*='hidden']")!;
    expect(rect(panel()).bottom).toBeGreaterThan(rect(clipper).bottom);
    expect(isTopLayer(panel())).toBe(true);
  });

  it("follows the trigger when the page moves under it", async () => {
    render(
      <div style={{ paddingTop: 40 }}>
        <div style={{ height: 40 }} />
        <Select value="G" onValueChange={() => {}} aria-label="Star type">
          <Select.Item value="G">G</Select.Item>
          <Select.Item value="K">K</Select.Item>
        </Select>
        <div style={{ height: "200vh" }} />
      </div>,
    );
    await settle();
    trigger().click();
    await settle();
    const before = (await stillAt(panel)).top;

    window.scrollTo(0, 120);
    const after = await stillAt(panel);
    expect(after.top).not.toBeCloseTo(before, 0);
    expect(after.top - rect(trigger()).bottom).toBeCloseTo(4, 0);
    window.scrollTo(0, 0);
  });
});

describe("Autocomplete panel placement", () => {
  const Field = () => {
    const [value, setValue] = useState("");
    return (
      <At top={40} left={40}>
        <Autocomplete
          value={value}
          onValueChange={setValue}
          options={[
            { value: "a", label: "TRAPPIST-1 e" },
            { value: "b", label: "TRAPPIST-1 f" },
          ]}
          onSelect={() => {}}
          aria-label="Find a planet"
        />
      </At>
    );
  };
  const input = () => document.querySelector<HTMLInputElement>("input")!;
  const panel = () => document.querySelector<HTMLElement>("[popover]")!;

  it("sits under the control, matching its width, in the top layer", async () => {
    render(<Field />);
    await settle();
    await userEvent.fill(input(), "tra");
    await settle();

    const control = input().closest("[class*='root']")!;
    const r = await stillAt(panel);
    expect(panel().matches(":popover-open")).toBe(true);
    expect(r.top - rect(control).bottom).toBeCloseTo(8, 0);
    expect(r.width).toBeCloseTo(rect(control).width, 0);
    expect(isTopLayer(panel())).toBe(true);
  });
});

describe("Popover placement", () => {
  const panel = () => document.querySelector<HTMLElement>("[role='dialog']")!;

  it("sits below its trigger by default, in the top layer", async () => {
    render(
      <At top={40} left={40}>
        <Popover label="Filter"><p>Minimum mass</p></Popover>
      </At>,
    );
    await settle();
    document.querySelector<HTMLButtonElement>("button")!.click();
    await settle();

    const r = await stillAt(panel);
    expect(panel().dataset.side).toBe("bottom");
    expect(r.top).toBeGreaterThan(rect(document.querySelector("button")!).bottom - 1);
    expect(isTopLayer(panel())).toBe(true);
  });

  it("flips above when the trigger is near the bottom", async () => {
    render(
      <At top="calc(100vh - 60px)" left={40}>
        <Popover label="Filter"><p>Minimum mass</p></Popover>
      </At>,
    );
    await settle();
    document.querySelector<HTMLButtonElement>("button")!.click();
    await settle();

    const r = await stillAt(panel);
    expect(panel().dataset.side).toBe("top");
    expect(r.bottom).toBeLessThanOrEqual(rect(document.querySelector("button")!).top + 1);
  });

  it("is placed before it is revealed, so it never travels the wrong way", async () => {
    // showMeasured: laid out with transitions off, measured, then shown — so
    // the reveal starts from the side it landed on.
    render(
      <At top="calc(100vh - 60px)" left={40}>
        <Popover label="Filter"><p>Minimum mass</p></Popover>
      </At>,
    );
    await settle();
    document.querySelector<HTMLButtonElement>("button")!.click();
    await settle();

    // Shown already knowing which side it is on, and with the measuring
    // states cleared, so the reveal runs from its starting style.
    expect(panel().matches(":popover-open")).toBe(true);
    expect(panel().dataset.side).toBe("top");
    expect(panel().hasAttribute("data-measuring")).toBe(false);
    expect(panel().hasAttribute("data-instant")).toBe(false);
  });

  it("keeps a wide panel on screen at the right edge", async () => {
    render(
      <At top={40} left="calc(100vw - 80px)">
        <Popover label="Filter"><p style={{ width: 240 }}>Minimum mass</p></Popover>
      </At>,
    );
    await settle();
    document.querySelector<HTMLButtonElement>("button")!.click();
    const r = await stillAt(panel);
    expect(r.right).toBeLessThanOrEqual(window.innerWidth);
    expect(r.left).toBeGreaterThanOrEqual(0);
  });
});

describe("Tooltip beside a control", () => {
  it("sits to the side when asked, flipping when that side has no room", async () => {
    // left/right are for a control in a vertical stack, where a tooltip above
    // or below would land on its neighbour.
    render(
      <At top={200} left={8}>
        <Tooltip label="Share" side="left">
          <Button aria-label="Share">↗</Button>
        </Tooltip>
      </At>,
    );
    await settle();
    const button = document.querySelector<HTMLButtonElement>("button")!;
    button.focus();
    await new Promise((r) => setTimeout(r, 500));

    const tip = () => document.querySelector<HTMLElement>("[role='tooltip']");
    const r = await stillAt(tip);
    // No room on the left at 8px in, so it takes the right.
    expect(tip()!.dataset.side).toBe("right");
    expect(r.left).toBeGreaterThanOrEqual(rect(button).right - 1);
  });

  it("takes the side it asked for when there is room", async () => {
    render(
      <At top={200} left={20}>
        <Tooltip label="Share" side="right">
          <Button aria-label="Share">↗</Button>
        </Tooltip>
      </At>,
    );
    await settle();
    document.querySelector<HTMLButtonElement>("button")!.focus();
    await new Promise((r) => setTimeout(r, 500));

    const tip = () => document.querySelector<HTMLElement>("[role='tooltip']");
    const r = await stillAt(tip);
    expect(tip()!.dataset.side).toBe("right");
    expect(r.left).toBeGreaterThanOrEqual(rect(document.querySelector("button")!).right - 1);
  });
});

describe("Dialog dismissal", () => {
  it("closes from a press on the backdrop, but not from one on the panel", async () => {
    // Which is which is geometry: the content wrapper covers the panel area,
    // and the <dialog> itself is what shows through around it. So this asks
    // the page what is actually at each point, then presses that.
    const { Dialog } = await import("./Dialog");
    render(
      <Dialog>
        <Dialog.Trigger><Button>Open</Button></Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Add to a system</Dialog.Title>
        </Dialog.Content>
      </Dialog>,
    );
    await settle();
    document.querySelector<HTMLButtonElement>("button")!.click();
    await settle();

    const dialog = document.querySelector("dialog")!;
    const box = dialog.getBoundingClientRect();

    // Both the press and the click have to land on the same element: a
    // selection drag out of the content must not dismiss on release.
    const press = (el: Element, x: number, y: number) => {
      el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: x, clientY: y, pointerId: 1, pointerType: "mouse" }));
      el.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: x, clientY: y }));
    };

    // In the middle of the panel the content wrapper is what is there.
    const midX = box.left + box.width / 2;
    const midY = box.top + 12;
    const onPanel = document.elementFromPoint(midX, midY)!;
    expect(dialog.contains(onPanel)).toBe(true);
    expect(onPanel).not.toBe(dialog);

    press(onPanel, midX, midY);
    await settle();
    expect(dialog.open).toBe(true);

    // Outside it, the dialog element itself is what shows through.
    press(dialog, Math.max(1, box.left - 20), Math.max(1, box.top - 20));
    await settle();
    await settle();
    expect(dialog.open).toBe(false);
  });
});

describe("DropdownMenu placement", () => {
  it("opens under its trigger, in the top layer", async () => {
    render(
      <At top={40} left={40}>
        <DropdownMenu label="Actions">
          <DropdownMenu.Item onSelect={() => {}}>Rename</DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => {}}>Delete</DropdownMenu.Item>
        </DropdownMenu>
      </At>,
    );
    await settle();
    const trigger = document.querySelector<HTMLButtonElement>("button")!;
    trigger.click();
    await settle();

    const menu = () => document.querySelector<HTMLElement>("[role='menu']");
    const r = await stillAt(menu);
    expect(menu()!.matches(":popover-open")).toBe(true);
    expect(r.top).toBeGreaterThan(rect(trigger).bottom - 1);
    expect(isTopLayer(menu()!)).toBe(true);
  });
});

describe("Tooltip placement", () => {
  it("appears beside what it describes, in the top layer", async () => {
    // Default side is bottom; "beside" here means under, and clear of it.
    render(
      <At top={200} left={200}>
        <Tooltip label="Share this world">
          <Button aria-label="Share">↗</Button>
        </Tooltip>
      </At>,
    );
    await settle();
    const button = document.querySelector<HTMLButtonElement>("button")!;
    button.focus();

    // The tooltip waits before appearing, so it does not flicker past.
    await new Promise((r) => setTimeout(r, 500));
    const tip = () => document.querySelector<HTMLElement>("[role='tooltip']");
    const r = await stillAt(tip);
    expect(tip()!.matches(":popover-open")).toBe(true);
    expect(tip()!.dataset.side).toBe("bottom");
    expect(r.top).toBeGreaterThanOrEqual(rect(button).bottom - 1);
    // Not the elementFromPoint check the other surfaces get: a tooltip takes
    // no pointer events, so what is under the cursor there is the page. That
    // it is in the top layer at all is what :popover-open above says.
    expect(getComputedStyle(tip()!).pointerEvents).toBe("none");
  });

  it("flips below a trigger too near the top to sit above", async () => {
    render(
      <At top={4} left={200}>
        <Tooltip label="Share this world" side="top">
          <Button aria-label="Share">↗</Button>
        </Tooltip>
      </At>,
    );
    await settle();
    document.querySelector<HTMLButtonElement>("button")!.focus();
    await new Promise((r) => setTimeout(r, 500));

    const tip = () => document.querySelector<HTMLElement>("[role='tooltip']");
    const r = await stillAt(tip);
    expect(tip()!.dataset.side).toBe("bottom");
    expect(r.top).toBeGreaterThanOrEqual(rect(document.querySelector("button")!).bottom - 1);
  });
});
