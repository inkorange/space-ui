/**
 * The Slider's geometry, in a browser that lays it out.
 *
 * Which thumb a press belongs to, and where the lit span sits, are questions
 * about pixels — unanswerable where every rectangle is zero.
 */
import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { useState } from "react";

import { Slider } from "./Slider";

const settle = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

function Range({
  onValueChange = () => {},
  start = 20,
  end = 80,
  ...rest
}: { onValueChange?: (v: number[]) => void; start?: number; end?: number } & Record<string, unknown>) {
  const [value, setValue] = useState([start, end]);
  return (
    <div style={{ width: 400 }}>
      <Slider
        value={value}
        onValueChange={(next) => {
          setValue(next);
          onValueChange(next);
        }}
        min={0}
        max={100}
        step={1}
        aria-label="Mass"
        {...rest}
      />
    </div>
  );
}

const thumbs = () => [...document.querySelectorAll("input[type=range]")] as HTMLInputElement[];
const drawn = () => [...document.querySelectorAll("[class*='thumb']")] as HTMLElement[];
const fill = () => document.querySelector("[class*='range']") as HTMLElement;
const root = () => document.querySelector("[class*='root']") as HTMLElement;

/** `auto` is the absence of a stacking order, which is below any number. */
const layer = (el: Element) => {
  const value = getComputedStyle(el).zIndex;
  return value === "auto" ? 0 : Number(value);
};

/** A press on the track at this fraction of its width. */
function pressTrack(at: number) {
  const box = root().getBoundingClientRect();
  root().dispatchEvent(
    new PointerEvent("pointerdown", {
      bubbles: true,
      clientX: box.left + box.width * at,
      clientY: box.top + box.height / 2,
      pointerId: 1,
      pointerType: "mouse",
    }),
  );
}

describe("Slider range", () => {
  it("lights only the span between the two thumbs", async () => {
    render(<Range />);
    await settle();

    const track = root().getBoundingClientRect();
    const lit = fill().getBoundingClientRect();
    // 20 to 80 of 100: starts a fifth along, covers three fifths.
    expect((lit.left - track.left) / track.width).toBeCloseTo(0.2, 1);
    expect(lit.width / track.width).toBeCloseTo(0.6, 1);
  });

  it("lights from the start when there is only one thumb", async () => {
    render(
      <div style={{ width: 400 }}>
        <Slider value={[25]} onValueChange={() => {}} min={0} max={100} step={1} aria-label="Mass" />
      </div>,
    );
    await settle();

    const track = root().getBoundingClientRect();
    const lit = fill().getBoundingClientRect();
    expect(lit.left - track.left).toBeCloseTo(0, 0);
    expect(lit.width / track.width).toBeCloseTo(0.25, 1);
  });

  it("puts each drawn thumb over its own value", async () => {
    render(<Range />);
    await settle();

    const track = root().getBoundingClientRect();
    const [low, high] = drawn().map((t) => t.getBoundingClientRect());
    expect((low.left + low.width / 2 - track.left) / track.width).toBeCloseTo(0.2, 1);
    expect((high.left + high.width / 2 - track.left) / track.width).toBeCloseTo(0.8, 1);
  });

  it("moves the nearer thumb when the track is pressed", async () => {
    const onValueChange = vi.fn();
    render(<Range onValueChange={onValueChange} />);
    await settle();

    // Nearer the lower thumb (20) than the upper (80).
    pressTrack(0.3);
    expect(onValueChange).toHaveBeenLastCalledWith([30, 80]);

    // Let the move land before pressing again: which thumb is nearer is
    // decided from the current values, not the ones this render was built on.
    await settle();

    // And now nearer the upper.
    pressTrack(0.9);
    expect(onValueChange).toHaveBeenLastCalledWith([30, 90]);
  });

  it("hands the keyboard the thumb the press moved", async () => {
    render(<Range />);
    await settle();

    pressTrack(0.9);
    expect(document.activeElement).toBe(thumbs()[1]);
  });

  it("leaves a press on a thumb to the browser", async () => {
    const onValueChange = vi.fn();
    render(<Range onValueChange={onValueChange} />);
    await settle();

    // A press that lands on the lower thumb itself must not be read as a
    // track press and jump the value to where the pointer is.
    const box = thumbs()[0].getBoundingClientRect();
    thumbs()[0].dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        clientX: box.left + box.width / 2,
        clientY: box.top + box.height / 2,
        pointerId: 1,
        pointerType: "mouse",
      }),
    );
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("keeps both thumbs reachable when they are stacked at the top", async () => {
    // Both at 100: the upper thumb has nowhere to go, so the lower one must
    // be the one on top, or the range can never be opened again.
    render(<Range start={100} end={100} />);
    await settle();

    const [lower, upper] = thumbs();
    expect(layer(lower)).toBeGreaterThan(layer(upper));
  });

  it("keeps both thumbs reachable when they are stacked anywhere else", async () => {
    render(<Range start={40} end={40} />);
    await settle();

    const [lower, upper] = thumbs();
    expect(layer(upper)).toBeGreaterThan(layer(lower));
  });

  it("only the thumbs take a pointer, so neither input swallows the other", async () => {
    render(<Range />);
    await settle();
    for (const input of thumbs()) {
      expect(getComputedStyle(input).pointerEvents).toBe("none");
    }
  });

  it("still takes a press anywhere on the track with one thumb", async () => {
    // Single-thumb sliders keep the native behaviour: the input covers the
    // track, so the browser moves the thumb to the press.
    render(
      <div style={{ width: 400 }}>
        <Slider value={[25]} onValueChange={() => {}} min={0} max={100} step={1} aria-label="Mass" />
      </div>,
    );
    await settle();
    expect(getComputedStyle(thumbs()[0]).pointerEvents).not.toBe("none");
  });
});
