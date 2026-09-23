"use client";
import type * as React from "react";
import { useId, useState } from "react";
import { cx } from "./propShared";
import styles from "./PieChart.module.scss";
import { formatValue, seriesColor } from "../internal/chartScale";

export interface PieSlice {
  /** The slice's name — always drawn in the legend, never colour alone. */
  label: string;
  /** Its size. Negative values are dropped: a pie has no way to show one. */
  value: number;
  /** Overrides this slice's colour. */
  color?: string;
}

export interface PieChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** The slices, in order. Sort before passing — usually largest first, which
   *  is what makes a pie readable at all. */
  slices: PieSlice[];
  /** Cut the middle out, making a donut. The hole gives the total somewhere
   *  to live, which is usually worth more than the extra ink. */
  donut?: boolean;
  /** Shown in a donut's middle, under the total. */
  label?: React.ReactNode;
  /** How wide the circle is, in pixels. Default 180. */
  size?: number;
  /** Show the legend. Default true: a pie without one is a colour quiz. */
  legend?: boolean;
  /** The lit finish, and the sweep on its first draw. Default true. */
  animated?: boolean;
  /** How a value is written, in the legend and the middle. */
  formatValue?: (value: number) => string;
  /** Called when a slice is chosen. */
  onSliceClick?: (slice: PieSlice, index: number) => void;
  /** Says what the whole shows. */
  "aria-label"?: string;
}

/** Where a fraction of the circle lands, measured clockwise from the top. */
const pointOnCircle = (centre: number, radius: number, fraction: number) => {
  const angle = fraction * 2 * Math.PI - Math.PI / 2;
  return { x: centre + radius * Math.cos(angle), y: centre + radius * Math.sin(angle) };
};

/**
 * Parts of a whole, as a circle.
 *
 * Worth saying plainly: a pie is the weakest way to compare sizes — people
 * read angles badly — and it is the wrong chart for more than a handful of
 * slices, for values that are not parts of one total, or for change over
 * time. Where the comparison is the point, `BarList` is easier to read. Where
 * a pie is right is a whole that splits a few ways and a reader who needs to
 * see "most of it" at a glance.
 *
 * So this one is built to stay readable: every slice keeps a hairline of the
 * surface between it and its neighbour, the legend carries the names and the
 * figures, and a donut puts the total in the middle where it can be read
 * exactly rather than estimated.
 */
export function PieChart({
  slices,
  donut = false,
  label,
  size = 180,
  legend = true,
  animated = true,
  formatValue: format = formatValue,
  onSliceClick,
  className,
  "aria-label": ariaLabel,
  ...rest
}: PieChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  // Gradient ids have to be unique per instance: two pies on one page would
  // otherwise both paint with whichever defs rendered last.
  const uid = useId();

  const usable = slices.filter((s) => s.value > 0);
  const total = usable.reduce((sum, s) => sum + s.value, 0);
  const centre = size / 2;
  const radius = centre - 2;
  const hole = donut ? radius * 0.62 : 0;

  let cursor = 0;
  const arcs = usable.map((slice, index) => {
    const fraction = total > 0 ? slice.value / total : 0;
    const from = cursor;
    cursor += fraction;

    const outerFrom = pointOnCircle(centre, radius, from);
    const outerTo = pointOnCircle(centre, radius, cursor);
    const large = fraction > 0.5 ? 1 : 0;

    // A single slice is the whole circle, which an arc cannot draw: its start
    // and end points are the same, so the path collapses to nothing.
    const whole = fraction >= 0.999;
    const d = whole
      ? donut
        ? `M${centre},${centre - radius} A${radius},${radius} 0 1 1 ${centre - 0.01},${centre - radius} Z ` +
          `M${centre},${centre - hole} A${hole},${hole} 0 1 0 ${centre - 0.01},${centre - hole} Z`
        : `M${centre},${centre - radius} A${radius},${radius} 0 1 1 ${centre - 0.01},${centre - radius} Z`
      : donut
        ? `M${outerFrom.x},${outerFrom.y} A${radius},${radius} 0 ${large} 1 ${outerTo.x},${outerTo.y} ` +
          `L${pointOnCircle(centre, hole, cursor).x},${pointOnCircle(centre, hole, cursor).y} ` +
          `A${hole},${hole} 0 ${large} 0 ${pointOnCircle(centre, hole, from).x},${pointOnCircle(centre, hole, from).y} Z`
        : `M${centre},${centre} L${outerFrom.x},${outerFrom.y} ` +
          `A${radius},${radius} 0 ${large} 1 ${outerTo.x},${outerTo.y} Z`;

    return { slice, index, d, fraction, fillRule: whole && donut ? ("evenodd" as const) : undefined };
  });

  const originalIndex = (slice: PieSlice) => slices.indexOf(slice);

  return (
    <div {...rest} className={cx(styles.root, className)} data-animated={animated ? "" : undefined}>
      <svg
        className={styles.svg}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={ariaLabel ?? "Pie chart"}
      >
        {/* The slices alone are swept in; the total in the middle is not part
            of the ring and should not be revealed by it. */}
        <defs>
          {/* The same light every planet in this library is lit by: a source
              up and to the left, a limb that falls away from it, and an edge
              that darkens where the disc turns away. */}
          <radialGradient id={`${uid}-face`} cx="32%" cy="26%" r="78%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#fff" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.28" />
          </radialGradient>
          <radialGradient id={`${uid}-edge`} cx="50%" cy="50%" r="50%">
            <stop offset="88%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
          </radialGradient>
        </defs>

        <g className={styles.sweep}>
          {arcs.map(({ slice, index, d, fillRule }) => (
            <path
              key={`${slice.label}-${index}`}
              className={cx(styles.slice, onSliceClick && styles.clickable)}
              d={d}
              fill={slice.color ?? seriesColor(originalIndex(slice))}
              fillRule={fillRule}
              data-dim={hovered !== null && hovered !== index ? "" : undefined}
              onPointerEnter={() => setHovered(index)}
              onPointerLeave={() => setHovered(null)}
              onClick={() => onSliceClick?.(slice, originalIndex(slice))}
            >
              <title>{`${slice.label}: ${format(slice.value)}`}</title>
            </path>
          ))}

          {/* Laid over the slices, not under them: the light falls on the
              whole disc rather than on each slice separately, which is what
              makes it read as one solid object. Angles are untouched — the
              circle stays a circle, so a quarter still looks like a quarter.
              A tilted pie would foreshorten it and make the near slices look
              bigger than equal ones at the back. */}
          <circle className={styles.face} cx={centre} cy={centre} r={radius} fill={`url(#${uid}-face)`} />
          <circle className={styles.face} cx={centre} cy={centre} r={radius} fill={`url(#${uid}-edge)`} />
          {donut && (
            // The wall of the hole, so the middle reads as cut through the
            // disc rather than printed on it.
            <circle
              className={styles.hole}
              cx={centre}
              cy={centre}
              r={hole}
              fill="none"
              stroke="#000"
              strokeOpacity="0.45"
              strokeWidth="3"
            />
          )}
        </g>

        {donut && (
          <>
            <text className={styles.total} x={centre} y={centre - (label ? 6 : 0)} textAnchor="middle" dominantBaseline="middle">
              {format(hovered !== null ? usable[hovered].value : total)}
            </text>
            {label && (
              <text className={styles.totalLabel} x={centre} y={centre + 14} textAnchor="middle" dominantBaseline="middle">
                {hovered !== null ? usable[hovered].label : label}
              </text>
            )}
          </>
        )}
      </svg>

      {legend && (
        <ul className={styles.legend}>
          {usable.map((slice, index) => (
            <li
              key={`${slice.label}-${index}`}
              className={styles.legendItem}
              data-dim={hovered !== null && hovered !== index ? "" : undefined}
            >
              <span
                className={styles.swatch}
                style={{ background: slice.color ?? seriesColor(originalIndex(slice)) }}
                aria-hidden="true"
              />
              <span className={styles.legendName}>{slice.label}</span>
              <span className={styles.legendValue}>
                {format(slice.value)}
                <span className={styles.legendPercent}>
                  {total > 0 ? Math.round((slice.value / total) * 100) : 0}%
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
