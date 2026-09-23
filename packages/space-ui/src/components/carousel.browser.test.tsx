/**
 * The Carousel's measuring, in a browser that actually lays it out.
 *
 * Everything here depends on real geometry: how wide a slide comes out, where
 * the row can come to rest, which stop is nearest. In happy-dom every
 * rectangle is zero, so none of this can be asked there — which is why these
 * live in their own suite.
 */
import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { Carousel } from "./Carousel";

const GAP = 16;

const settle = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

/** The row scrolls smoothly, so a press lands over several frames rather than
 *  one. Waits for it to come to rest, then answers where it stopped. */
async function restsAt(track: HTMLElement): Promise<number> {
  let last = NaN;
  for (let i = 0; i < 120; i++) {
    await settle();
    if (track.scrollLeft === last) return track.scrollLeft;
    last = track.scrollLeft;
  }
  return track.scrollLeft;
}

/** A row of slides in a box of a known width, so the arithmetic is checkable.
 *  Waits for the first measured frame: React commits asynchronously, and the
 *  component measures in a layout effect after that. */
async function mount(props: Record<string, unknown>, count = 8, width = 800) {
  const slides = Array.from({ length: count }, (_, i) => (
    <div key={i} style={{ height: 80 }}>Slide {i + 1}</div>
  ));
  const screen = render(
    <div style={{ width }}>
      <Carousel aria-label="Planets" {...props}>{slides}</Carousel>
    </div>,
  );
  await settle();
  const root = document.querySelector("[aria-roledescription='carousel']")!;
  const track = root.querySelector<HTMLElement>("[tabindex='0']")!;
  return { screen, root, track };
}
const dots = (root: Element) => [...root.querySelectorAll("[aria-label^='Position'],[aria-label^='Page']")];
const activeDot = (root: Element) => dots(root).findIndex((d) => d.getAttribute("aria-current") === "true");
const arrow = (root: Element, name: "Previous" | "Next") =>
  root.querySelector<HTMLButtonElement>(`[aria-label="${name}"]`)!;

describe("Carousel measurement", () => {
  it("divides the row by the view count, leaving the gaps between", async () => {
    const { track } = await mount({ perView: 3 });
    const slide = track.children[0].getBoundingClientRect().width;
    // (800 - 2 gaps) / 3
    expect(slide).toBeCloseTo((800 - GAP * 2) / 3, 1);
  });

  it("shows a fraction of a slide when asked for one", async () => {
    const { track } = await mount({ perView: 2.5 });
    const slide = track.children[0].getBoundingClientRect().width;
    expect(slide).toBeCloseTo((800 - GAP * 1.5) / 2.5, 1);
    // The half slide is the cue that there is more: the row must overflow.
    expect(track.scrollWidth).toBeGreaterThan(track.clientWidth);
  });

  it("gives a dot to every place the row can stop", async () => {
    const { root } = await mount({ perView: 2, showPagination: true });
    // 8 slides, 2 in view: 7 places to stop.
    expect(dots(root)).toHaveLength(7);
  });

  it("gives a dot per page when it steps by page", async () => {
    const { root } = await mount({ perView: 2, step: "page", showPagination: true });
    expect(dots(root)).toHaveLength(4);
  });

  it("counts no unreachable stop when a slide overflows its column", async () => {
    // The shipped bug: the last stop came from the raw scroll width, which
    // mandatory snapping never lets the row rest at, so the dots gained one
    // nobody could reach and the end lit the dot before it.
    const { root, track } = await mount({ perView: 2, showPagination: true });
    for (const slide of [...track.children]) {
      const filler = document.createElement("div");
      filler.style.minWidth = "520px";
      filler.style.height = "1px";
      slide.append(filler);
    }
    await settle();
    await settle();

    const count = dots(root).length;
    track.scrollTo({ left: track.scrollWidth, behavior: "instant" });
    await settle();
    await settle();
    expect(activeDot(root)).toBe(count - 1);
    expect(arrow(root, "Next").disabled).toBe(true);
  });

  it("steps one slide at a time, and stops at the end", async () => {
    const { root, track } = await mount({ perView: 2 });
    const step = track.children[0].getBoundingClientRect().width + GAP;

    expect(arrow(root, "Previous").disabled).toBe(true);
    arrow(root, "Next").click();
    expect(await restsAt(track)).toBeCloseTo(step, 0);

    arrow(root, "Next").click();
    expect(await restsAt(track)).toBeCloseTo(step * 2, 0);

    arrow(root, "Previous").click();
    expect(await restsAt(track)).toBeCloseTo(step, 0);
  });

  it("steps a whole page when told to", async () => {
    const { root, track } = await mount({ perView: 2, step: "page" });
    const page = (track.children[0].getBoundingClientRect().width + GAP) * 2;

    arrow(root, "Next").click();
    expect(await restsAt(track)).toBeCloseTo(page, 0);
  });

  it("turns each arrow off at the end it cannot pass", async () => {
    const { root, track } = await mount({ perView: 2 });
    expect(arrow(root, "Previous").disabled).toBe(true);
    expect(arrow(root, "Next").disabled).toBe(false);

    track.scrollTo({ left: track.scrollWidth, behavior: "instant" });
    await settle();
    await settle();
    expect(arrow(root, "Next").disabled).toBe(true);
    expect(arrow(root, "Previous").disabled).toBe(false);
  });

  it("follows the scroll position with the lit dot", async () => {
    const { root, track } = await mount({ perView: 2, showPagination: true });
    expect(activeDot(root)).toBe(0);

    const step = track.children[0].getBoundingClientRect().width + GAP;
    track.scrollTo({ left: step * 3, behavior: "instant" });
    await settle();
    await settle();
    expect(activeDot(root)).toBe(3);
  });

  it("jumps to the stop a dot stands for", async () => {
    const { root, track } = await mount({ perView: 2, showPagination: true });
    const step = track.children[0].getBoundingClientRect().width + GAP;

    (dots(root)[4] as HTMLElement).click();
    expect(await restsAt(track)).toBeCloseTo(step * 4, 0);
  });

  it("hides the arrows and dots when everything already fits", async () => {
    const { root } = await mount({ perView: 3, showPagination: true }, 3);
    expect(root.hasAttribute("data-scrollable")).toBe(false);
    expect(dots(root)).toHaveLength(0);
  });

  it("re-measures when a stylesheet changes the view count", async () => {
    const { root, track } = await mount({ perView: 2, showPagination: true });
    expect(dots(root)).toHaveLength(7);
    const before = track.children[0].getBoundingClientRect().width;

    // What a media query does: the token wins over the prop.
    (root as HTMLElement).style.setProperty("--sp-carousel-view-count", "4");
    // A ResizeObserver callback, then a render: give it a few frames.
    await vi.waitFor(() => expect(dots(root)).toHaveLength(5));
    expect(track.children[0].getBoundingClientRect().width).toBeLessThan(before);
  });
});

describe("Carousel mouse drag", () => {
  const press = (el: Element, x: number, type: string, extra: Record<string, unknown> = {}) =>
    el.dispatchEvent(
      new PointerEvent(type, { clientX: x, clientY: 40, pointerId: 1, pointerType: "mouse", button: 0, bubbles: true, cancelable: true, ...extra }),
    );

  it("follows the pointer, then settles on the next stop", async () => {
    const { track } = await mount({ perView: 2 });
    const step = track.children[0].getBoundingClientRect().width + GAP;

    press(track, 400, "pointerdown");
    press(track, 340, "pointermove");
    // Held: the row is under the pointer, with snapping off so it can be.
    expect(track.scrollLeft).toBeCloseTo(60, 0);
    expect(track.hasAttribute("data-dragging")).toBe(true);

    press(track, 340, "pointerup");
    expect(track.hasAttribute("data-dragging")).toBe(false);
    // A deliberate drag moves at least one stop, however short it was.
    expect(await restsAt(track)).toBeCloseTo(step, 0);
  });

  it("drags back the other way too", async () => {
    const { track } = await mount({ perView: 2 });
    const step = track.children[0].getBoundingClientRect().width + GAP;
    track.scrollTo({ left: step * 2, behavior: "instant" });
    await settle();

    press(track, 300, "pointerdown");
    press(track, 360, "pointermove");
    press(track, 360, "pointerup");
    expect(await restsAt(track)).toBeCloseTo(step, 0);
  });

  it("treats a press that barely moves as a click, not a drag", async () => {
    const onClick = vi.fn();
    const { track } = await mount({ perView: 2 });
    track.children[0].addEventListener("click", onClick);

    press(track, 400, "pointerdown");
    press(track, 402, "pointermove");
    expect(track.hasAttribute("data-dragging")).toBe(false);
    press(track, 402, "pointerup");
    track.children[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onClick).toHaveBeenCalled();
  });

  it("never clicks the slide a drag ended on", async () => {
    const onClick = vi.fn();
    const { track } = await mount({ perView: 2 });
    track.children[0].addEventListener("click", onClick);

    press(track, 400, "pointerdown");
    press(track, 320, "pointermove");
    press(track, 320, "pointerup");
    track.children[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("ignores a touch, which the platform already scrolls", async () => {
    const { track } = await mount({ perView: 2 });
    press(track, 400, "pointerdown", { pointerType: "touch" });
    press(track, 320, "pointermove", { pointerType: "touch" });
    expect(track.hasAttribute("data-dragging")).toBe(false);
    expect(track.scrollLeft).toBe(0);
  });
});
