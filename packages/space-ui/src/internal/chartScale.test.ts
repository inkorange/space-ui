/** The arithmetic the charts are drawn from. Pure, so it is checked directly. */
import { describe, it, expect } from "vitest";
import {
  SERIES_COLOR_COUNT, bandPositions, barPath, formatValue, linearScale, pointPositions, seriesColor,
} from "./chartScale";

describe("linearScale", () => {
  it("starts at zero and rounds the top up to a whole tick", () => {
    const scale = linearScale([3, 44, 17]);
    expect(scale.min).toBe(0);
    expect(scale.max).toBeGreaterThanOrEqual(44);
    expect(scale.ticks[0]).toBe(0);
    expect(scale.ticks.at(-1)).toBe(scale.max);
  });

  it("picks steps a person would have picked", () => {
    // 1, 2 or 5 times a power of ten — never 3.7.
    for (const values of [[9], [44], [180], [0.6], [12000]]) {
      const { ticks } = linearScale(values);
      const step = ticks[1] - ticks[0];
      const scaled = step / 10 ** Math.floor(Math.log10(step));
      expect([1, 2, 5, 10]).toContain(Math.round(scaled));
    }
  });

  it("gives flat data an axis with height rather than one line", () => {
    // Values that never change still need somewhere to be drawn: with a zero
    // baseline the axis spans 0 to the value, and all-zero gets a unit axis.
    expect(linearScale([5, 5, 5]).max).toBe(5);
    expect(linearScale([5, 5, 5]).min).toBe(0);
    expect(linearScale([0, 0]).max).toBe(1);
    // Without the zero baseline there is nothing but the value itself, so the
    // scale opens a span around it rather than collapsing to a line.
    const flat = linearScale([5, 5], { zeroBased: false });
    expect(flat.max).toBeGreaterThan(flat.min);
  });

  it("keeps zero on the axis when values fall below it", () => {
    const scale = linearScale([-20, 40]);
    expect(scale.min).toBeLessThanOrEqual(-20);
    expect(scale.ticks).toContain(0);
    expect(scale.ratio(0)).toBeGreaterThan(0);
  });

  it("may start away from zero only when asked", () => {
    expect(linearScale([100, 110], { zeroBased: false }).min).toBeGreaterThan(0);
    expect(linearScale([100, 110]).min).toBe(0);
  });

  it("labels ticks exactly, without floating-point dust", () => {
    // Accumulating a float step gives 0.30000000000000004; counting does not.
    const { ticks } = linearScale([0, 1], { tickCount: 10 });
    for (const tick of ticks) expect(String(tick)).not.toMatch(/\d{6,}/);
  });

  it("places a value as a fraction of the axis", () => {
    const scale = linearScale([0, 100]);
    expect(scale.ratio(scale.min)).toBe(0);
    expect(scale.ratio(scale.max)).toBe(1);
    expect(scale.ratio((scale.min + scale.max) / 2)).toBeCloseTo(0.5, 5);
  });
});

describe("the series palette", () => {
  it("is an order, so a series keeps its colour wherever it sits", () => {
    expect(seriesColor(0)).toContain("series-1");
    expect(seriesColor(3)).toContain("series-4");
  });

  it("names eight, then repeats rather than inventing a ninth", () => {
    expect(SERIES_COLOR_COUNT).toBe(8);
    expect(seriesColor(8)).toBe(seriesColor(0));
  });

  it("only ever names tokens the library promises", () => {
    for (let i = 0; i < SERIES_COLOR_COUNT; i++) {
      expect(seriesColor(i)).toMatch(/^var\(--sp-chart-series-[1-8]-color\)$/);
    }
  });
});

describe("positions", () => {
  it("centres each category in its own slot", () => {
    const { centre, width } = bandPositions(4);
    expect(centre).toEqual([0.125, 0.375, 0.625, 0.875]);
    // Bars leave room either side, so neighbours never touch.
    expect(width).toBeLessThan(0.25);
  });

  it("puts a line's first and last points on the ends", () => {
    expect(pointPositions(5)).toEqual([0, 0.25, 0.5, 0.75, 1]);
    expect(pointPositions(1)).toEqual([0.5]);
    expect(pointPositions(0)).toEqual([]);
  });
});

describe("barPath", () => {
  it("rounds the value end and leaves the baseline square", () => {
    const up = barPath(0, 0, 20, 100, 4, true);
    // Arcs at the top, a straight run back along the bottom.
    expect(up.startsWith("M0,100")).toBe(true);
    expect((up.match(/a4,4/g) ?? []).length).toBe(2);

    const down = barPath(0, 0, 20, 100, 4, false);
    expect(down.startsWith("M0,0")).toBe(true);
  });

  it("never rounds more than the bar can carry", () => {
    // A 2px-tall bar with a 4px radius would otherwise curl into itself.
    const tiny = barPath(0, 0, 20, 2, 4, true);
    expect(tiny).toContain("a2,2");
    expect(barPath(0, 0, 20, 0, 4, true)).not.toContain("a");
  });
});

describe("formatValue", () => {
  it("separates thousands and trims long decimals", () => {
    expect(formatValue(12000)).toBe("12,000");
    expect(formatValue(1)).toBe("1");
    expect(formatValue(0.815)).toBe("0.82");
  });
});
