/**
 * The arithmetic every chart here shares: how many colours there are, what a
 * readable set of axis ticks is, and how a value becomes a position.
 *
 * Kept apart from the components because it is pure — given the same numbers
 * it returns the same answer — which is also what makes it testable without a
 * browser, unlike everything that has to be measured.
 */

/**
 * The palette, written out rather than built from an index: a token name
 * assembled at runtime cannot be checked against the ones the library
 * promises, and the check is what keeps these honest.
 */
const SERIES_COLORS = [
  "var(--sp-chart-series-1-color)",
  "var(--sp-chart-series-2-color)",
  "var(--sp-chart-series-3-color)",
  "var(--sp-chart-series-4-color)",
  "var(--sp-chart-series-5-color)",
  "var(--sp-chart-series-6-color)",
  "var(--sp-chart-series-7-color)",
  "var(--sp-chart-series-8-color)",
] as const;

/** How many series the palette names. A ninth is never invented: see `seriesColor`. */
export const SERIES_COLOR_COUNT = SERIES_COLORS.length;

/**
 * The colour for a series, by its position.
 *
 * The palette is an order, not a pool. Slot 1 is always the first series, so
 * hiding one never repaints the rest — a legend toggle that recoloured the
 * survivors would make the reader re-learn the chart.
 *
 * Past the eighth the colours repeat, which is a state worth avoiding rather
 * than papering over: group the tail into "Other", or split the chart. The
 * components warn once in development when a chart goes past it.
 */
export const seriesColor = (index: number): string =>
  SERIES_COLORS[index % SERIES_COLOR_COUNT];

/** A tick step a person would have chosen: 1, 2 or 5 times a power of ten. */
function niceStep(rough: number): number {
  if (rough <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const scaled = rough / magnitude;
  const step = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10;
  return step * magnitude;
}

export interface Scale {
  /** The value at the bottom of the axis — zero unless something is negative. */
  min: number;
  /** The value at the top: a whole tick at or above the largest value. */
  max: number;
  /** The values to label, bottom to top. */
  ticks: number[];
  /** Where a value sits, 0 at the axis minimum and 1 at its maximum. */
  ratio: (value: number) => number;
}

/**
 * An axis for these values: a zero baseline and ticks at readable intervals.
 *
 * The top is the first whole tick at or above the largest value, so a bar
 * whose value lands exactly on a tick reaches the top line — which is the
 * honest drawing of it, not an error.
 *
 * Bars are measured from zero, always — a bar chart that starts at 40 makes a
 * 5% difference look like a fivefold one. Lines may start elsewhere, and pass
 * `zeroBased: false` to say so.
 */
export function linearScale(
  values: number[],
  { tickCount = 5, zeroBased = true }: { tickCount?: number; zeroBased?: boolean } = {},
): Scale {
  const real = values.filter((v) => Number.isFinite(v));
  const lowest = real.length ? Math.min(...real) : 0;
  const highest = real.length ? Math.max(...real) : 0;

  // Flat data still needs an axis with height, or every mark lands on one line.
  let low = zeroBased ? Math.min(0, lowest) : lowest;
  let high = zeroBased ? Math.max(0, highest) : highest;
  if (low === high) {
    if (low === 0) high = 1;
    else {
      low = Math.min(0, low);
      high = Math.max(0, high);
    }
  }

  const step = niceStep((high - low) / Math.max(1, tickCount));
  const from = Math.floor(low / step) * step;
  const to = Math.ceil(high / step) * step;

  const ticks: number[] = [];
  // Counted rather than accumulated: adding a float step repeatedly drifts,
  // and the labels would read 0.30000000000000004.
  const count = Math.round((to - from) / step);
  for (let i = 0; i <= count; i++) ticks.push(Number((from + i * step).toPrecision(12)));

  const span = to - from || 1;
  return { min: from, max: to, ticks, ratio: (value) => (value - from) / span };
}

/**
 * Where each category sits along the x axis, as a fraction of the width.
 *
 * `band` is the middle of each slot — what a bar is centred on, and where a
 * line's point sits. Bars share their slot: `inset` is how much of it is left
 * clear either side, so neighbouring bars do not touch.
 */
export function bandPositions(count: number, inset = 0.25): { centre: number[]; width: number } {
  if (count <= 0) return { centre: [], width: 0 };
  const slot = 1 / count;
  return {
    centre: Array.from({ length: count }, (_, i) => slot * (i + 0.5)),
    width: slot * (1 - inset * 2),
  };
}

/**
 * A bar as a path, rounded at the end the value reaches and square where it
 * meets the baseline — a bar is a length measured from the axis, and rounding
 * that end would round away the thing being measured. `up` is false for a
 * value below zero, which rounds the bottom instead.
 */
export function barPath(
  x: number, y: number, width: number, height: number, radius: number, up = true,
): string {
  const r = Math.max(0, Math.min(radius, width / 2, height));
  if (r === 0) return `M${x},${y}h${width}v${height}h${-width}Z`;
  return up
    ? `M${x},${y + height}V${y + r}a${r},${r} 0 0 1 ${r},${-r}h${width - r * 2}` +
      `a${r},${r} 0 0 1 ${r},${r}V${y + height}Z`
    : `M${x},${y}V${y + height - r}a${r},${r} 0 0 0 ${r},${r}h${width - r * 2}` +
      `a${r},${r} 0 0 0 ${r},${-r}V${y}Z`;
}

/** Points along the x axis for a line: first at the left edge, last at the right. */
export function pointPositions(count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [0.5];
  return Array.from({ length: count }, (_, i) => i / (count - 1));
}

/**
 * Whether this is a development build, read off the global rather than from
 * `process`: the library is bundled for browsers too, where naming `process`
 * is both untyped and, in some bundlers, a runtime error.
 */
export const isDevelopment = (): boolean => {
  const global = globalThis as { process?: { env?: { NODE_ENV?: string } } };
  return global.process?.env?.NODE_ENV !== "production";
};

/** A number as a label: thousands separated, long decimals trimmed. */
export const formatValue = (value: number): string =>
  Number.isInteger(value)
    ? value.toLocaleString("en-US")
    : value.toLocaleString("en-US", { maximumFractionDigits: 2 });
