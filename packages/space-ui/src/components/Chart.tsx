"use client";
import type * as React from "react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { cx } from "./propShared";
import styles from "./Chart.module.scss";
import {
  SERIES_COLOR_COUNT, bandPositions, barPath, formatValue, isDevelopment, linearScale,
  pointPositions, seriesColor,
} from "../internal/chartScale";

export interface ChartSeries {
  /** Named in the legend and the tooltip, so say what the numbers are. */
  name: string;
  /** One value per category, in the same order. `null` is a gap — a month with
   *  no reading — and is drawn as one rather than as zero. */
  data: (number | null)[];
  /** Overrides this series' colour. Leave it alone unless the series has a
   *  meaning of its own that a reader already associates with a colour. */
  color?: string;
}

export interface ChartPoint {
  /** The series the point belongs to. */
  series: string;
  seriesIndex: number;
  /** The category beneath it. */
  category: string;
  categoryIndex: number;
  value: number;
}

export interface ChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
  /** How to draw it. The same data can be any of the three: bars for
   *  comparing amounts, a line for a trend, an area for a trend whose total
   *  matters. Switching is a prop, so a chart can offer the choice. */
  type: "bar" | "line" | "area";
  /** The x axis, in order. Every series' `data` lines up with this by
   *  position, so they must be the same length. */
  categories: string[];
  /** One entry per dataset. */
  series: ChartSeries[];
  /** How tall the plot is, in pixels. The width comes from the container.
   *  Default 240. */
  height?: number;
  /** Stack the series instead of setting them side by side (bar) or overlaying
   *  them (area). For parts of a whole, where the total is the point. */
  stacked?: boolean;
  /** Show the legend. Defaults to true for more than one series, which is when
   *  colour alone would otherwise be carrying the identity. */
  legend?: boolean;
  /** Draw the horizontal grid lines. Default true. */
  grid?: boolean;
  /** How a value is written, in labels and the tooltip. */
  formatValue?: (value: number) => string;
  /** Roughly how many labelled ticks the y axis gets. Default 5. */
  tickCount?: number;
  /** The lit finish this library gives everything else: marks that catch the
   *  light, and a first draw where bars rise from the axis and a line draws
   *  itself on. Default true; a reader who asked for less motion gets the
   *  finish without the movement either way. */
  animated?: boolean;
  /** The category index from which the data is still arriving — usually
   *  `categories.length - 1`, today's bar, which will keep growing until the
   *  day ends. Those bars are drawn hatched rather than solid, and the
   *  tooltip and the table say "so far", so a half-counted day is never read
   *  as a collapse. Bars only: a line says the same thing with its own last
   *  segment, which is a separate job. */
  partialFrom?: number;
  /** Called when a bar or point is chosen, with what it stands for. Keyboard
   *  activation reports the same thing a click does. */
  onPointClick?: (point: ChartPoint) => void;
  /** Says what the chart shows, for a reader who cannot see it. The figures
   *  themselves are always available in the table this renders for screen
   *  readers, so this wants the point, not the numbers. */
  "aria-label"?: string;
}

/** The reading under the pointer: which category, and where to put the card. */
interface Hover {
  index: number;
  x: number;
}

const PADDING = { top: 8, right: 8, bottom: 24 };
/** Room for the y labels. Widened per chart by the longest one. */
const AXIS_GUTTER = 8;

/**
 * A chart of one or more datasets over a shared set of categories — as bars,
 * a line, or a filled area.
 *
 * Drawn as plain SVG from the library's own arithmetic: no charting
 * dependency, and every colour, size and radius is a token, so a chart is the
 * same material as the rest of the page.
 *
 * The series palette is an order rather than a pool. The first series is
 * always the first colour, so hiding one never repaints the others.
 *
 * What it does without being asked: a legend once there is more than one
 * series, a crosshair reading every series at the category under the pointer,
 * and a table of the same numbers for screen readers. What it refuses to do:
 * a second y axis. Two measures on different scales belong in two charts —
 * one pair of axes can be drawn to tell any story you like.
 */
export function Chart({
  type,
  categories,
  series,
  height = 240,
  stacked = false,
  legend,
  grid = true,
  formatValue: format = formatValue,
  tickCount = 5,
  animated = true,
  partialFrom,
  onPointClick,
  className,
  "aria-label": ariaLabel,
  ...rest
}: ChartProps) {
  const titleId = useId();
  const plotRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<Hover | null>(null);

  // The plot is as wide as its container: the width has to be measured, since
  // an SVG cannot size its own coordinate system from a percentage.
  useEffect(() => {
    const node = plotRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(node);
    setWidth(Math.round(node.getBoundingClientRect().width));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isDevelopment()) return;
    if (series.length > SERIES_COLOR_COUNT) {
      // Not an error: it still draws. But two series now share a colour, and
      // no amount of care elsewhere makes that readable.
      console.warn(
        `Chart: ${series.length} series, but the palette names ${SERIES_COLOR_COUNT}. ` +
          "Past that the colours repeat. Group the tail into an \"Other\" series, or split the chart.",
      );
    }
    const wrong = series.filter((s) => s.data.length !== categories.length);
    if (wrong.length) {
      console.warn(
        `Chart: ${wrong.map((s) => `"${s.name}"`).join(", ")} ${wrong.length === 1 ? "has" : "have"} ` +
          `a different number of values than there are categories (${categories.length}). ` +
          "Values line up with categories by position, so the tail will be missing.",
      );
    }
  }, [series, categories.length]);

  const stackable = stacked && (type === "bar" || type === "area");
  // Only bars are hatched; a line has its own way of showing an unfinished
  // tail, and drawing one here would be two claims at once.
  const partial = type === "bar" && typeof partialFrom === "number" && partialFrom >= 0;
  const stillFilling = (index: number) => partial && index >= (partialFrom as number);

  // What the axis has to cover: the values themselves, or the running totals
  // when the series are stacked on top of one another.
  const scale = useMemo(() => {
    const values: number[] = [];
    if (stackable) {
      categories.forEach((_, i) => {
        let positive = 0;
        let negative = 0;
        series.forEach((s) => {
          const v = s.data[i];
          if (typeof v !== "number") return;
          if (v >= 0) positive += v;
          else negative += v;
        });
        values.push(positive, negative);
      });
    } else {
      series.forEach((s) => s.data.forEach((v) => { if (typeof v === "number") values.push(v); }));
    }
    // Bars are read as lengths from zero; a line is read as a shape, so it may
    // start where the data does — but not when something is negative, where
    // the zero line is the thing that gives the shape meaning.
    return linearScale(values, { tickCount, zeroBased: type !== "line" || values.some((v) => v < 0) });
  }, [series, categories, stackable, tickCount, type]);

  const labels = useMemo(() => scale.ticks.map(format), [scale.ticks, format]);
  // The gutter fits the longest label rather than a guess: 7px a character is
  // close enough for the digits and separators these labels are made of.
  const gutter = Math.max(...labels.map((l) => l.length * 7), 24) + AXIS_GUTTER;

  const plotWidth = Math.max(0, width - gutter - PADDING.right);
  const plotHeight = Math.max(0, height - PADDING.top - PADDING.bottom);
  // A line's first and last points sit on the ends of the axis, so without
  // this their category labels hang off both edges. Bars need none: they are
  // already inset inside their own slots.
  const edge = type === "bar" ? 0 : 16;
  const x = (ratio: number) => gutter + edge + ratio * Math.max(0, plotWidth - edge * 2);
  const y = (value: number) => PADDING.top + (1 - scale.ratio(value)) * plotHeight;

  const band = bandPositions(categories.length);
  const points = pointPositions(categories.length);
  const colorOf = (i: number) => series[i]?.color ?? seriesColor(i);
  const showLegend = legend ?? series.length > 1;

  /** Running totals, so a stacked mark knows what it sits on. */
  const baseline = useMemo(() => {
    const bases: number[][] = series.map(() => []);
    categories.forEach((_, i) => {
      let positive = 0;
      let negative = 0;
      series.forEach((s, si) => {
        const v = s.data[i];
        if (!stackable || typeof v !== "number") {
          bases[si][i] = 0;
          return;
        }
        if (v >= 0) { bases[si][i] = positive; positive += v; }
        else { bases[si][i] = negative; negative += v; }
      });
    });
    return bases;
  }, [series, categories, stackable]);

  const readingAt = useCallback(
    (clientX: number) => {
      const node = plotRef.current;
      if (!node || !categories.length || plotWidth <= 0) return null;
      const box = node.getBoundingClientRect();
      const span = type === "bar" ? plotWidth : Math.max(1, plotWidth - 32);
      const ratio = (clientX - box.left - gutter - (type === "bar" ? 0 : 16)) / span;
      const positions = type === "bar" ? band.centre : points;
      let nearest = 0;
      positions.forEach((p, i) => {
        if (Math.abs(p - ratio) < Math.abs(positions[nearest] - ratio)) nearest = i;
      });
      return { index: nearest, x: x(positions[nearest]) };
    },
    // x and the position arrays are derived from these; listing them keeps the
    // callback honest without re-creating it on every render.
    [categories.length, gutter, plotWidth, type, band.centre, points], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const report = (seriesIndex: number, categoryIndex: number) => {
    const value = series[seriesIndex]?.data[categoryIndex];
    if (typeof value !== "number" || !onPointClick) return;
    onPointClick({
      series: series[seriesIndex].name,
      seriesIndex,
      category: categories[categoryIndex],
      categoryIndex,
      value,
    });
  };

  const barWidth = stackable || series.length === 1
    ? band.width * plotWidth
    : (band.width * plotWidth) / series.length;

  return (
    <div
      {...rest}
      className={cx(styles.root, className)}
      data-type={type}
      data-animated={animated ? "" : undefined}
      style={{ ...rest.style }}
    >
      <div
        ref={plotRef}
        className={styles.plot}
        style={{ height }}
        onPointerMove={(e) => {
          if (e.pointerType === "touch") return;
          setHover(readingAt(e.clientX));
        }}
        onPointerLeave={() => setHover(null)}
      >
        {/* aria-hidden: the same numbers are in the table below, which is what
            a screen reader reads. A pile of unlabelled <rect>s is noise. */}
        <svg
          className={styles.svg}
          width={width || undefined}
          height={height}
          viewBox={width ? `0 0 ${width} ${height}` : undefined}
          role="img"
          aria-labelledby={ariaLabel ? undefined : titleId}
          aria-label={ariaLabel}
        >
          <defs>
            {series.map((s2, si) => (
              <linearGradient key={`grad-${si}`} id={`${titleId}-grad-${si}`} x1="0" y1="0" x2="0" y2="1">
                {/* The limb again: brightest where the light lands, falling
                    away into the ground it stands on. */}
                <stop offset="0%" stopColor={colorOf(si)} stopOpacity="1" />
                <stop offset="100%" stopColor={colorOf(si)} stopOpacity="0.55" />
              </linearGradient>
            ))}
            {series.map((s2, si) => (
              <linearGradient key={`area-${si}`} id={`${titleId}-area-${si}`} x1="0" y1="0" x2="0" y2="1">
                {/* An atmosphere rather than a slab: dense at the line, thinning
                    to nothing before the axis. */}
                <stop offset="0%" stopColor={colorOf(si)} stopOpacity="0.45" />
                <stop offset="100%" stopColor={colorOf(si)} stopOpacity="0.02" />
              </linearGradient>
            ))}
          </defs>

          {/* Diagonal stripes in the series' own colour: a bar that is still
              filling reads as unfinished at a glance, and keeps its identity.
              One pattern per series, because a pattern carries its own paint. */}
          {partial && (
            <defs>
              {series.map((s2, si) => (
                <pattern
                  key={`hatch-${si}`}
                  id={`${titleId}-hatch-${si}`}
                  width="8"
                  height="8"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <rect width="8" height="8" fill="transparent" />
                  <line className={styles.hatch} x1="2" y1="0" x2="2" y2="8" stroke={colorOf(si)} />
                  <line className={styles.hatch} x1="6" y1="0" x2="6" y2="8" stroke={colorOf(si)} />
                </pattern>
              ))}
            </defs>
          )}

          {grid && scale.ticks.map((tick) => (
            <line
              key={`grid-${tick}`}
              className={cx(styles.grid, tick === 0 && scale.min < 0 && styles.zeroLine)}
              x1={gutter}
              x2={gutter + plotWidth}
              y1={y(tick)}
              y2={y(tick)}
            />
          ))}

          {scale.ticks.map((tick, i) => (
            <text key={`label-${tick}`} className={styles.axisLabel} x={gutter - AXIS_GUTTER} y={y(tick)} textAnchor="end" dominantBaseline="middle">
              {labels[i]}
            </text>
          ))}

          {categories.map((category, i) => (
            <text
              key={`cat-${category}-${i}`}
              className={styles.axisLabel}
              x={x(type === "bar" ? band.centre[i] : points[i])}
              y={height - PADDING.bottom / 2}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {category}
            </text>
          ))}

          {type === "bar" && series.map((s, si) => (
            <g key={`bars-${s.name}-${si}`}>
              {categories.map((category, ci) => {
                const value = s.data[ci];
                if (typeof value !== "number") return null;
                const base = baseline[si][ci];
                const top = y(base + value);
                const bottom = y(base);
                const slotLeft = x(band.centre[ci]) - (band.width * plotWidth) / 2;
                const left = stackable || series.length === 1
                  ? slotLeft
                  : slotLeft + si * barWidth;
                // 2px of the surface between neighbouring bars, so two fills
                // never read as one.
                const drawWidth = Math.max(1, barWidth - (series.length > 1 && !stackable ? 2 : 0));
                const drawHeight = Math.max(1, Math.abs(bottom - top));
                const stillCounting = partial && ci >= (partialFrom as number);
                return (
                  <path
                    key={`bar-${category}-${ci}`}
                    className={cx(styles.bar, onPointClick && styles.clickable)}
                    d={barPath(left, Math.min(top, bottom), drawWidth, drawHeight, 4, value >= 0)}
                    fill={stillCounting ? `url(#${titleId}-hatch-${si})` : `url(#${titleId}-grad-${si})`}
                    // currentColor is what the glow in the stylesheet burns.
                    color={colorOf(si)}
                    data-dim={hover && hover.index !== ci ? "" : undefined}
                    onClick={() => report(si, ci)}
                  >
                    <title>
                      {`${s.name}, ${category}: ${format(value)}${stillCounting ? " so far" : ""}`}
                    </title>
                  </path>
                );
              })}
            </g>
          ))}

          {type !== "bar" && series.map((s, si) => {
            // A null is a gap: the line stops and starts again rather than
            // drawing a straight run through missing readings.
            const runs: { i: number; value: number; base: number }[][] = [];
            let run: { i: number; value: number; base: number }[] = [];
            s.data.forEach((value, i) => {
              if (typeof value !== "number") {
                if (run.length) runs.push(run);
                run = [];
                return;
              }
              run.push({ i, value, base: baseline[si][i] });
            });
            if (run.length) runs.push(run);

            return (
              <g key={`line-${s.name}-${si}`}>
                {runs.map((segment, ri) => {
                  const line = segment
                    .map((p, k) => `${k === 0 ? "M" : "L"}${x(points[p.i])},${y(p.base + p.value)}`)
                    .join(" ");
                  const area = type === "area"
                    ? `${line} L${x(points[segment[segment.length - 1].i])},${y(segment[segment.length - 1].base)} ` +
                      segment.slice().reverse().map((p) => `L${x(points[p.i])},${y(p.base)}`).join(" ") + " Z"
                    : null;
                  return (
                    <g key={`run-${ri}`}>
                      {area && (
                        <path className={styles.area} d={area} fill={`url(#${titleId}-area-${si})`} />
                      )}
                      <path
                        className={styles.line}
                        d={line}
                        stroke={colorOf(si)}
                        color={colorOf(si)}
                        fill="none"
                        pathLength={1}
                      />
                    </g>
                  );
                })}
                {/* A marker per reading, shown at the crosshair — and always,
                    when a series is a single point with no line to carry it. */}
                {s.data.map((value, ci) =>
                  typeof value === "number" ? (
                    <circle
                      key={`dot-${ci}`}
                      className={cx(styles.dot, onPointClick && styles.clickable)}
                      cx={x(points[ci])}
                      cy={y(baseline[si][ci] + value)}
                      r={4}
                      fill={colorOf(si)}
                      color={colorOf(si)}
                      data-on={hover?.index === ci ? "" : undefined}
                      onClick={() => report(si, ci)}
                    >
                      <title>{`${s.name}, ${categories[ci]}: ${format(value)}`}</title>
                    </circle>
                  ) : null,
                )}
              </g>
            );
          })}

          {hover && (
            <line
              className={styles.crosshair}
              x1={hover.x}
              x2={hover.x}
              y1={PADDING.top}
              y2={PADDING.top + plotHeight}
            />
          )}
        </svg>

        {hover && (
          <div
            className={styles.tooltip}
            // Placed from the left when the reading is on the left half and
            // from the right when it is not, so the card never runs off.
            style={
              hover.x > gutter + plotWidth / 2
                ? { right: Math.max(0, width - hover.x + 12) }
                : { left: hover.x + 12 }
            }
            role="status"
          >
            <p className={styles.tooltipHead}>{categories[hover.index]}</p>
            <ul className={styles.tooltipList}>
              {series.map((s, si) => {
                const value = s.data[hover.index];
                return (
                  <li key={s.name} className={styles.tooltipRow}>
                    <span className={styles.swatch} style={{ background: colorOf(si) }} aria-hidden="true" />
                    <span className={styles.tooltipName}>{s.name}</span>
                    <span className={styles.tooltipValue}>
                      {typeof value === "number" ? format(value) : "—"}
                      {stillFilling(hover.index) && typeof value === "number" && (
                        <span className={styles.partialNote}>so far</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {showLegend && (
        <ul className={styles.legend}>
          {series.map((s, si) => (
            <li key={s.name} className={styles.legendItem}>
              <span className={styles.swatch} style={{ background: colorOf(si) }} aria-hidden="true" />
              {s.name}
            </li>
          ))}
        </ul>
      )}

      {/* The figures, for a reader who cannot see the picture. Visually
          hidden rather than absent: the alternative is a chart that says
          nothing at all to a screen reader. */}
      <table className={styles.data} id={titleId}>
        <caption>{ariaLabel ?? "Chart data"}</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            {series.map((s) => <th key={s.name} scope="col">{s.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {categories.map((category, ci) => (
            <tr key={category}>
              <th scope="row">{category}</th>
              {series.map((s) => (
                <td key={s.name}>
                  {typeof s.data[ci] === "number" ? format(s.data[ci] as number) : "—"}
                  {stillFilling(ci) && typeof s.data[ci] === "number" ? " so far" : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
