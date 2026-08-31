"use client";
import type * as React from "react";
import { forwardRef } from "react";
import { cx } from "./propShared";
import styles from "./Slider.module.scss";
import ctl from "../styles/spaceControls.module.scss";

export interface SliderProps {
  value: number[];
  onValueChange: (v: number[]) => void;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

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
