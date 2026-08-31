"use client";
import type * as React from "react";
import { cx } from "./propShared";
import styles from "./Progress.module.scss";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
}

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
