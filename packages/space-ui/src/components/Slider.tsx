"use client";
import type * as React from "react";
import { forwardRef, useEffect, useRef } from "react";
import { cx } from "./propShared";
import styles from "./Slider.module.scss";
import ctl from "../styles/spaceControls";

export interface SliderProps {
  /** The value, as an array. One number is one thumb; two is a range, read
   *  as `[start, end]` and kept in that order — the thumbs cannot swap
   *  places, so index 0 is always the lower of the two. Fully controlled. */
  value: number[];
  /** Called with the whole array as a thumb moves, in the same shape it was
   *  given. */
  onValueChange: (value: number[]) => void;
  /** Lower bound. */
  min: number;
  /** Upper bound. */
  max: number;
  /** The increment a thumb moves by, and the grid every value lands on: with
   *  `step={10}` over 0–100 a thumb stops at 0, 10, 20 … and nothing between,
   *  whether it is dragged, pressed on the track, or walked with the arrow
   *  keys. Counted from `min`, so a range of 5–105 with a step of 10 lands on
   *  5, 15, 25 … Default 1, the same as a bare `<input type="range">`. */
  step?: number;
  /** How close the two thumbs may come, in the value's own units. 0 lets
   *  them meet; a positive number keeps a gap, for a range that would mean
   *  nothing empty — "between 2 and 2 bedrooms". Ignored with one thumb. */
  minDistance?: number;
  /** Blocks interaction and removes it from the tab order. */
  disabled?: boolean;
  /** Merged onto the wrapper. */
  className?: string;
  /** Accessible name. Required unless a visible label references it, since a
   *  slider has no text of its own. With two thumbs each one needs its own
   *  name, so this is suffixed — "Mass minimum", "Mass maximum" — unless
   *  `thumbLabels` says otherwise. */
  "aria-label"?: string;
  /** Names for the two thumbs, when the generated ones do not fit: a price
   *  range might want "From" and "To". */
  thumbLabels?: [string, string];
}

const clamp = (value: number, low: number, high: number) =>
  Math.min(Math.max(value, low), high);

/**
 * A range control: one thumb for a value, two for a span between values.
 *
 * Each thumb is a real `<input type="range">`, so arrow keys, Home, End and
 * Page Up/Down all work without this component reimplementing them, and a
 * screen reader announces a slider because it is one. What is drawn — the
 * glass tube, the lit fill, the little planet of a thumb — sits on top of
 * inputs that are invisible but still doing the work.
 *
 * With two thumbs they cannot cross: each is clamped to the other, so the
 * array stays in order and a range can never read back inverted. `minDistance`
 * keeps a gap between them where a zero-width range would be meaningless.
 *
 * The pointer is the component's own business, and the inputs take none of it.
 * Two inputs each covering the whole track cannot decide between them which
 * thumb a press meant: the browser hit-tests before any of this code runs, so
 * the answer came down to which input was later in the DOM. Whenever the
 * thumbs were within a thumb's width of each other — constant over a wide
 * range, where a few units are a fraction of a pixel — a press on the lower
 * one was handed to the upper one, which then refused to travel. So a press
 * anywhere on the control is measured here, against where the thumbs actually
 * are, and the nearest one is dragged until the pointer is released.
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    value,
    onValueChange,
    min,
    max,
    step = 1,
    minDistance = 0,
    disabled,
    className,
    "aria-label": ariaLabel,
    thumbLabels,
  },
  ref,
) {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const marks = useRef<(HTMLSpanElement | null)[]>([]);
  /** The drag in progress: which thumb it carries, and where it began. A null
   *  `index` means the press was exactly on two stacked thumbs and has not yet
   *  said which one it wants — see `onPointerDown`. */
  const drag = useRef<{ index: number | null; startX: number } | null>(null);
  /** Takes the window listeners back off again. */
  const release = useRef<(() => void) | null>(null);

  const isRange = value.length > 1;
  const span = max - min || 1;
  const lower = clamp(value[0] ?? min, min, max);
  const upper = isRange ? clamp(value[1] ?? max, min, max) : lower;
  const values = isRange ? [lower, upper] : [lower];

  const percent = (v: number) => ((v - min) / span) * 100;

  /**
   * What the component knows right now.
   *
   * A drag's listeners are attached once, when the pointer goes down, so they
   * close over that render — and the value they are moving changes under them
   * on every frame of the drag. Reading through a ref instead means the
   * clamping sees where the OTHER thumb is now, not where it was when the
   * drag began, which is the difference between two thumbs that cannot cross
   * and two that cross once and stick.
   */
  const now = useRef({ values, min, max, span, step, minDistance, isRange, onValueChange });
  now.current = { values, min, max, span, step, minDistance, isRange, onValueChange };

  /** The nearest value on the step grid at or below `v`, and at or above. The
   *  grid is counted from `min`, and rounded before flooring because a sum of
   *  floats lands a hair under the mark often enough to matter: 0.1 * 3 is
   *  0.30000000000000004, and floor would send it a whole step backwards. */
  const gridBelow = (v: number) => {
    const s = now.current;
    return s.min + Math.floor(Number(((v - s.min) / s.step).toFixed(8))) * s.step;
  };
  const gridAbove = (v: number) => {
    const s = now.current;
    return s.min + Math.ceil(Number(((v - s.min) / s.step).toFixed(8))) * s.step;
  };

  /** A thumb's new value, clamped so the two can never cross — and kept on
   *  the step grid while doing it. A `minDistance` that is not a whole number
   *  of steps would otherwise park a thumb between two steps: with a step of
   *  10 and a gap of 25, stopping against the neighbour means 75, which is
   *  not a value this slider can otherwise produce. The gap is the floor, so
   *  the thumb settles on the next step that still honours it. */
  const clampThumb = (index: number, next: number) => {
    const s = now.current;
    if (!s.isRange) return clamp(next, s.min, s.max);
    return index === 0
      ? clamp(next, s.min, Math.max(s.min, gridBelow(s.values[1] - s.minDistance)))
      : clamp(next, Math.min(s.max, gridAbove(s.values[0] + s.minDistance)), s.max);
  };

  const move = (index: number, next: number) => {
    const s = now.current;
    const settled = clampThumb(index, next);
    if (settled === s.values[index]) return;
    const updated = [...s.values];
    updated[index] = settled;
    s.onValueChange(updated);
  };

  /** The value a press at this point on the screen is asking for. */
  const valueAt = (clientX: number) => {
    const s = now.current;
    const box = rootRef.current?.getBoundingClientRect();
    if (!box || box.width === 0) return s.values[0];
    const ratio = clamp((clientX - box.left) / box.width, 0, 1);
    const raw = s.min + ratio * s.span;
    return clamp(s.min + Math.round((raw - s.min) / s.step) * s.step, s.min, s.max);
  };

  /** Where a thumb is drawn, in screen pixels, and how wide it is. */
  const markBox = (index: number) => marks.current[index]?.getBoundingClientRect();

  /**
   * Which thumb a press belongs to: the one drawn nearest the pointer. Asking
   * in pixels rather than in values is the point — over a wide range two very
   * different numbers are the same place on screen, and the reader is pressing
   * a place.
   */
  const nearestTo = (clientX: number): number | null => {
    if (!now.current.isRange) return 0;
    const first = markBox(0);
    const second = markBox(1);
    if (!first || !second) return 0;
    const firstCentre = first.left + first.width / 2;
    const toFirst = Math.abs(clientX - firstCentre);
    const toSecond = Math.abs(clientX - (second.left + second.width / 2));
    if (toFirst !== toSecond) return toFirst < toSecond ? 0 : 1;
    // Equally near, which with two thumbs at one value is every press on
    // them. Off to one side, the side is the answer: a press to the left of
    // the pair wants the lower thumb, because that is the one that can travel
    // that way. Dead centre, nothing in the press says which, so the question
    // is left to the first move of the drag.
    if (Math.abs(clientX - firstCentre) <= 1) return null;
    return clientX < firstCentre ? 0 : 1;
  };

  /** Whether the press landed on the thumb itself rather than on the track. */
  const onThumb = (index: number, clientX: number) => {
    const box = markBox(index);
    if (!box) return false;
    return Math.abs(clientX - (box.left + box.width / 2)) <= box.width / 2;
  };

  const stopDragging = () => {
    drag.current = null;
    rootRef.current?.removeAttribute("data-dragging");
    release.current?.();
  };

  /**
   * Takes hold of a thumb and drags it until the pointer lets go.
   *
   * A press on the track moves the nearest thumb to it first; a press on a
   * thumb takes hold of it where it stands, so grabbing a handle never jogs
   * the value before the drag has begun.
   */
  const onPointerDown = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (disabled || event.button !== 0) return;
    // A second pointer coming down mid-drag would otherwise strand the first
    // drag's listeners on the window.
    release.current?.();

    const index = nearestTo(event.clientX);
    drag.current = { index, startX: event.clientX };
    rootRef.current?.setAttribute("data-dragging", "");

    if (index !== null) {
      if (!onThumb(index, event.clientX)) move(index, valueAt(event.clientX));
      // Focus follows the press, so the keyboard carries on from the thumb the
      // reader just moved.
      inputs.current[index]?.focus();
    }

    // Keeps the drag alive when the pointer leaves the control, and keeps a
    // touch drag from scrolling the page with it. Synthetic events in a test
    // have no live pointer to capture, hence the guard rather than a crash.
    try {
      rootRef.current?.setPointerCapture(event.pointerId);
    } catch {
      /* no such pointer */
    }

    const onPointerMove = (e: PointerEvent) => {
      const held = drag.current;
      if (!held) return;
      if (held.index === null) {
        // The press sat on two stacked thumbs. Whichever way it travels names
        // the thumb: left is the lower one, right is the upper, and those are
        // the only directions each can go from a dead heat.
        const travelled = e.clientX - held.startX;
        if (Math.abs(travelled) < 1) return;
        held.index = travelled < 0 ? 0 : 1;
        inputs.current[held.index]?.focus();
      }
      move(held.index, valueAt(e.clientX));
    };
    // On the window, not the element: a drag that runs off the end of the
    // track has to keep reporting, and the release can happen anywhere.
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
    release.current = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
      release.current = null;
    };

    // Stops the press selecting the text around the slider as it travels.
    event.preventDefault();
  };

  // A slider unmounted mid-drag would otherwise leave its listeners behind.
  useEffect(() => () => release.current?.(), []);

  const labelFor = (index: number) => {
    if (thumbLabels) return thumbLabels[index];
    if (!isRange) return ariaLabel;
    if (!ariaLabel) return index === 0 ? "Minimum" : "Maximum";
    return `${ariaLabel} ${index === 0 ? "minimum" : "maximum"}`;
  };

  return (
    <span
      ref={rootRef}
      className={cx(styles.root, ctl.spaceSlider, className)}
      data-disabled={disabled || undefined}
      data-range={isRange || undefined}
      onPointerDown={onPointerDown}
    >
      <span className={cx(styles.track, "spSliderTrack")}>
        <span
          className={cx(styles.range, "spSliderRange")}
          style={{
            insetInlineStart: `${isRange ? percent(lower) : 0}%`,
            width: `${isRange ? percent(upper) - percent(lower) : percent(lower)}%`,
          }}
        />
      </span>

      {values.map((v, index) => (
        <span
          key={index}
          ref={(node) => {
            marks.current[index] = node;
          }}
          className={cx(styles.thumb, "spSliderThumb")}
          style={{ left: `${percent(v)}%` }}
          data-thumb={index}
        />
      ))}

      {values.map((v, index) => (
        <input
          key={index}
          ref={(node) => {
            inputs.current[index] = node;
            if (index === 0) {
              if (typeof ref === "function") ref(node);
              else if (ref) ref.current = node;
            }
          }}
          type="range"
          className={cx(styles.input, "spSliderInput")}
          value={v}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          aria-label={labelFor(index)}
          onChange={(e) => move(index, Number(e.target.value))}
        />
      ))}
    </span>
  );
});
