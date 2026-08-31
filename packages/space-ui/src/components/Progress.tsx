"use client";
import type * as React from "react";
import { cx } from "./propShared";
import styles from "./Progress.module.scss";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current progress, clamped between 0 and `max`. */
  value: number;
  /** The value representing complete. */
  max?: number;
}

/**
 * A determinate bar for work you can measure — use Loader when you cannot.
 *
 * Speaks the same visual language as Slider, because a progress bar and a
 * slider track are the same object: one you watch, one you drag.
 */
export function Progress({ value, max = 100, className, style, ...rest }: ProgressProps) {
  const pct = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;
  return (
    <div
      {...rest}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cx(styles.progress, className)}
      style={style}
    >
      {/* Unclassed on purpose: a consumer can target `.progress > div`
          without knowing the hashed module class. */}
      <div style={{ width: `${pct}%`, height: "100%" }} />
    </div>
  );
}
