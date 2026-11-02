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
  max = 100,
  ...rest
}: { onValueChange?: (v: number[]) => void; start?: number; end?: number; max?: number } & Record<string, unknown>) {
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
        max={max}
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

/** A pointer move, delivered where a captured drag's listeners hear it. */
function move(x: number) {
  const y = root().getBoundingClientRect().top + 10;
  window.dispatchEvent(
    new PointerEvent("pointermove", { bubbles: true, clientX: x, clientY: y, pointerId: 1, pointerType: "mouse" }),
  );
}

/** A whole drag: press at the first x, travel through the rest, release. */
function dragFrom(x: number, ...through: number[]) {
  const y = root().getBoundingClientRect().top + 10;
  const target = document.elementFromPoint(x, y) ?? root();
  target.dispatchEvent(
    new PointerEvent("pointerdown", {
      bubbles: true, clientX: x, clientY: y, pointerId: 1, pointerType: "mouse", button: 0,
    }),
  );
  for (const next of through) move(next);
  window.dispatchEvent(
    new PointerEvent("pointerup", {
      bubbles: true, clientX: through.at(-1) ?? x, clientY: y, pointerId: 1, pointerType: "mouse",
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

  it("grabs a thumb without moving it", async () => {
    const onValueChange = vi.fn();
    render(<Range onValueChange={onValueChange} />);
    await settle();

    // A press on the thumb takes hold of it where it stands. Only a press on
    // the track moves it to the pointer.
    const box = drawn()[0].getBoundingClientRect();
    dragFrom(box.left + box.width / 2);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("grabs the thumb nearest the pointer, not whichever is stacked on top", async () => {
    // The bug this test exists for. Over a wide range two values a few units
    // apart are a fraction of a pixel apart on screen, so the thumbs sit on
    // top of each other. Pressing the lower one used to hand the drag to the
    // upper one, whose clamp then refused to travel — the thumb snapped a
    // step and stopped.
    const seen: number[][] = [];
    render(<Range start={5000} end={5005} max={10000} onValueChange={(v) => seen.push(v)} />);
    await settle();

    const centre = drawn()[0].getBoundingClientRect();
    const x = centre.left + centre.width / 2;
    dragFrom(x - 2, x - 40);
    await settle();

    const last = seen.at(-1)!;
    expect(last[0]).toBeLessThan(5000);
    expect(last[1]).toBe(5005);
  });

  it("can still grab either thumb when the two hold the same value", async () => {
    for (const [direction, expected] of [["left", 0], ["right", 1]] as const) {
      const seen: number[][] = [];
      document.body.innerHTML = "";
      render(<Range start={50} end={50} onValueChange={(v) => seen.push(v)} />);
      await settle();

      const box = root().getBoundingClientRect();
      const mid = box.left + box.width / 2;
      dragFrom(mid, direction === "left" ? mid - 60 : mid + 60);
      await settle();

      const last = seen.at(-1)!;
      // Whichever thumb was asked for is the one that moved; the other stayed.
      expect(last[expected === 0 ? 1 : 0]).toBe(50);
      expect(expected === 0 ? last[0] < 50 : last[1] > 50).toBe(true);
    }
  });

  it("can grab a thumb sitting at the maximum", async () => {
    // Half of that thumb hangs past the end of the track, so the press has to
    // be taken by the thumb rather than by the track underneath it.
    const seen: number[][] = [];
    render(<Range start={0} end={100} onValueChange={(v) => seen.push(v)} />);
    await settle();

    const box = drawn()[1].getBoundingClientRect();
    const x = box.left + box.width / 2;
    dragFrom(x, x - 80);
    await settle();

    expect(seen.at(-1)![1]).toBeLessThan(100);
  });

  it("keeps dragging after the press, instead of jumping once and stopping", async () => {
    const seen: number[][] = [];
    render(<Range onValueChange={(v) => seen.push(v)} />);
    await settle();

    const box = root().getBoundingClientRect();
    const at = (f: number) => box.left + box.width * f;
    dragFrom(at(0.3), at(0.4), at(0.5), at(0.6));
    await settle();

    // One jump is the old behaviour: a press moved a thumb and the drag died
    // with it, because no input had the pointer.
    expect(seen.length).toBeGreaterThan(2);
    const lowers = seen.map((v) => v[0]);
    expect(lowers.at(-1)!).toBeGreaterThan(lowers[0]);
  });

  it("lets go on release", async () => {
    const seen: number[][] = [];
    render(<Range onValueChange={(v) => seen.push(v)} />);
    await settle();

    const box = root().getBoundingClientRect();
    const at = (f: number) => box.left + box.width * f;
    dragFrom(at(0.3), at(0.4));
    await settle();
    const after = seen.length;

    // The pointer is up; moving it must do nothing.
    move(at(0.9));
    await settle();
    expect(seen.length).toBe(after);
  });

  it("drags a single thumb from a press anywhere on the track", async () => {
    const seen: number[][] = [];
    render(
      <div style={{ width: 400 }}>
        <Slider value={[25]} onValueChange={(v) => seen.push(v)} min={0} max={100} step={1} aria-label="Mass" />
      </div>,
    );
    await settle();

    const box = root().getBoundingClientRect();
    dragFrom(box.left + box.width * 0.2, box.left + box.width * 0.75);
    await settle();

    expect(seen.at(-1)![0]).toBeGreaterThan(60);
  });
});
