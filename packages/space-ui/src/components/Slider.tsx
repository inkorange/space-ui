"use client";
import type * as React from "react";
import { forwardRef, useRef } from "react";
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

  const isRange = value.length > 1;
  const span = max - min || 1;
  const lower = clamp(value[0] ?? min, min, max);
  const upper = isRange ? clamp(value[1] ?? max, min, max) : lower;
  const values = isRange ? [lower, upper] : [lower];

  const percent = (v: number) => ((v - min) / span) * 100;

  /** The nearest value on the step grid at or below `v`, and at or above. The
   *  grid is counted from `min`, and rounded before flooring because a sum of
   *  floats lands a hair under the mark often enough to matter: 0.1 * 3 is
   *  0.30000000000000004, and floor would send it a whole step backwards. */
  const gridBelow = (v: number) => min + Math.floor(Number(((v - min) / step).toFixed(8))) * step;
  const gridAbove = (v: number) => min + Math.ceil(Number(((v - min) / step).toFixed(8))) * step;

  /** A thumb's new value, clamped so the two can never cross — and kept on
   *  the step grid while doing it. A `minDistance` that is not a whole number
   *  of steps would otherwise park a thumb between two steps: with a step of
   *  10 and a gap of 25, stopping against the neighbour means 75, which is
   *  not a value this slider can otherwise produce. The gap is the floor, so
   *  the thumb settles on the next step that still honours it. */
  const clampThumb = (index: number, next: number) => {
    if (!isRange) return clamp(next, min, max);
    return index === 0
      ? clamp(next, min, Math.max(min, gridBelow(upper - minDistance)))
      : clamp(next, Math.min(max, gridAbove(lower + minDistance)), max);
  };

  const move = (index: number, next: number) => {
    const settled = clampThumb(index, next);
    if (settled === values[index]) return;
    const updated = [...values];
    updated[index] = settled;
    onValueChange(updated);
  };

  /** Which thumb a press at this point is asking for: the nearer one, and at
   *  a tie the one that can actually travel that way. */
  const nearestTo = (target: number) => {
    if (!isRange) return 0;
    const toLower = Math.abs(target - lower);
    const toUpper = Math.abs(target - upper);
    if (toLower === toUpper) return target < lower ? 0 : 1;
    return toLower < toUpper ? 0 : 1;
  };

  /** A press on the track moves the nearer thumb to it, rather than doing
   *  nothing: with two overlaid inputs only the thumbs take pointer events,
   *  so without this the track would be dead to the pointer. */
  const onTrackPointerDown = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (!isRange || disabled) return;
    // A press that landed on a thumb is the browser's to handle.
    if ((event.target as HTMLElement).tagName === "INPUT") return;

    const box = rootRef.current?.getBoundingClientRect();
    if (!box || box.width === 0) return;

    const ratio = clamp((event.clientX - box.left) / box.width, 0, 1);
    const raw = min + ratio * span;
    const snapped = clamp(min + Math.round((raw - min) / step) * step, min, max);
    const index = nearestTo(snapped);

    move(index, snapped);
    // Focus follows the press, so the keyboard carries on from the thumb the
    // reader just moved.
    inputs.current[index]?.focus();
  };

  const labelFor = (index: number) => {
    if (thumbLabels) return thumbLabels[index];
    if (!isRange) return ariaLabel;
    if (!ariaLabel) return index === 0 ? "Minimum" : "Maximum";
    return `${ariaLabel} ${index === 0 ? "minimum" : "maximum"}`;
  };

  // Stacked thumbs would otherwise leave one unreachable: at the top of the
  // scale the upper thumb covers the lower, and vice versa. Raise whichever
  // one still has somewhere to go.
  const raised = isRange && lower === upper ? (upper >= max ? 0 : 1) : -1;

  return (
    <span
      ref={rootRef}
      className={cx(styles.root, ctl.spaceSlider, className)}
      data-disabled={disabled || undefined}
      data-range={isRange || undefined}
      onPointerDown={onTrackPointerDown}
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
          style={raised === index ? { zIndex: 1 } : undefined}
          onChange={(e) => move(index, Number(e.target.value))}
        />
      ))}
    </span>
  );
});
