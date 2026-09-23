"use client";
import type * as React from "react";
import { cx } from "./propShared";
import styles from "./BarList.module.scss";
import { formatValue, seriesColor } from "../internal/chartScale";

export interface BarListItem {
  /** The row's name, at the left. */
  label: string;
  /** How long the bar is, against the largest value or an explicit `max`. */
  value: number;
  /** Overrides this row's colour. One colour for the set reads as a ranking;
   *  a colour per row reads as categories. */
  color?: string;
}

export interface BarListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** The rows, in the order they should appear. Sort before passing: the
   *  order is the caller's statement about the data, not this component's. */
  items: BarListItem[];
  /** What a full track means. Defaults to the largest value, which makes the
   *  rows relative to each other. Pass the total to make them shares of it. */
  max?: number;
  /** Show each row's share as a percentage beside its value. */
  showPercent?: boolean;
  /** How the value is written. */
  formatValue?: (value: number) => string;
  /** Give every row its own colour from the series palette, rather than one
   *  colour for the set. */
  colorful?: boolean;
  /** Fill the bars on first render, one row after the next, the way results
   *  arrive. Default true; a reader who asked for less motion gets the bars
   *  already filled either way. */
  animated?: boolean;
  /** Called when a row is chosen. Rows become buttons when this is given, and
   *  stay plain text when it is not — nothing looks clickable unless it is. */
  onItemClick?: (item: BarListItem, index: number) => void;
  /** Names the set for assistive tech: "Poll results", say. */
  "aria-label"?: string;
}

/**
 * A ranked list of values as bars: a label, a track, a filled bar, a figure.
 *
 * For results read against each other — a poll, the top ten by some measure,
 * a breakdown of a total. It is the form to reach for when the category names
 * are words rather than dates: they get a column of their own and stay
 * readable, where a vertical bar chart would turn them on their side.
 *
 * No axis and no grid, because there is nothing to measure against but the
 * other rows: every bar is drawn against the longest one, or against `max`
 * when the share of a known total is the point.
 */
export function BarList({
  items,
  max,
  showPercent = false,
  formatValue: format = formatValue,
  colorful = false,
  animated = true,
  onItemClick,
  className,
  "aria-label": ariaLabel,
  ...rest
}: BarListProps) {
  const largest = max ?? Math.max(0, ...items.map((i) => i.value));
  const total = items.reduce((sum, i) => sum + (i.value > 0 ? i.value : 0), 0);

  return (
    <div
      {...rest}
      className={cx(styles.root, className)}
      role="list"
      aria-label={ariaLabel}
      data-animated={animated ? "" : undefined}
    >
      {items.map((item, index) => {
        // A zero-length bar still shows its rounded cap, so a row with no
        // votes reads as a row with no votes rather than as a missing row.
        const ratio = largest > 0 ? Math.max(0, item.value) / largest : 0;
        const percent = total > 0 ? (item.value / total) * 100 : 0;
        const fill = item.color ?? (colorful ? seriesColor(index) : "var(--sp-chart-series-1-color)");

        const row = (
          <>
            <span className={styles.label}>{item.label}</span>
            <span className={styles.track}>
              <span
                className={styles.fill}
                style={{
                  width: `${ratio * 100}%`,
                  background: fill,
                  // Each row starts a little after the one above, so a poll
                  // reads as counting up rather than snapping into place.
                  // Capped, or a long list would still be filling when the
                  // reader has finished reading it.
                  animationDelay: `${Math.min(index * 60, 360)}ms`,
                }}
              />
            </span>
            <span className={styles.value}>
              {format(item.value)}
              {showPercent && <span className={styles.percent}>{Math.round(percent)}%</span>}
            </span>
          </>
        );

        return (
          <div key={`${item.label}-${index}`} role="listitem" className={styles.row}>
            {onItemClick ? (
              <button
                type="button"
                className={cx(styles.line, styles.pressable)}
                onClick={() => onItemClick(item, index)}
              >
                {row}
              </button>
            ) : (
              <span className={styles.line}>{row}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
