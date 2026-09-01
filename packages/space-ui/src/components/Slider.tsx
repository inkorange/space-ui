"use client";
import type * as React from "react";
import { forwardRef } from "react";
import { cx } from "./propShared";
import styles from "./Slider.module.scss";
import ctl from "../styles/spaceControls";

export interface SliderProps {
  /** Current value, as a single-element array. Fully controlled. */
  value: number[];
  /** Called with the new value array as the thumb moves. */
  onValueChange: (v: number[]) => void;
  /** Lower bound. */
  min: number;
  /** Upper bound. */
  max: number;
  /** Smallest increment the thumb can move by. */
  step: number;
  /** Blocks interaction and removes it from the tab order. */
  disabled?: boolean;
  /** Merged onto the wrapper. */
  className?: string;
  /** Accessible name. Required unless a visible label references it,
   *  since a slider has no text of its own.
   */
  "aria-label"?: string;
}

/**
 * A range control for a continuous value.
 *
 * Takes and returns an array so multiple thumbs can be added later without a
 * breaking change, even though it renders one today.
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { value, onValueChange, min, max, step, disabled, className, "aria-label": ariaLabel },
  ref,
) {
  const v = value[0] ?? min;
  const pct = max === min ? 0 : ((v - min) / (max - min)) * 100;
  return (
    <span className={cx(styles.root, ctl.spaceSlider, className)} data-disabled={disabled || undefined}>
      <span className={cx(styles.track, "spSliderTrack")}>
        <span className={cx(styles.range, "spSliderRange")} style={{ width: `${pct}%` }} />
      </span>
      <span className={cx(styles.thumb, "spSliderThumb")} style={{ left: `${pct}%` }} />
      <input
        ref={ref}
        type="range"
        className={cx(styles.input, "spSliderInput")}
        value={v}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onValueChange([Number(e.target.value)])}
      />
    </span>
  );
});
