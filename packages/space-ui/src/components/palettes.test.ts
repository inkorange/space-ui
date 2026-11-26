/**
 * The palette layer's permanent invariants.
 *
 * styles/palettes.css ships as its own entry, so a consumer can import it and
 * set one attribute. That only works if every preset answers the same
 * questions, and if a palette stays inside its remit: it moves the light and
 * the primary accent, and it leaves contrast, status and data alone.
 *
 * These are guards, not examples. Adding a preset should fail here until it
 * is complete, and widening what a palette may touch should fail here until
 * someone changes the rule on purpose.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const read = (name: string) => readFileSync(path.join(__dirname, "..", "styles", name), "utf8");
const palettes = read("palettes.css");
const tokens = read("tokens.css");

/** Each `[data-sp-palette="name"] { ... }` block, by name. */
const presets = new Map<string, string>(
  [...palettes.matchAll(/\[data-sp-palette="([a-z-]+)"\]\s*\{([^}]*)\}/g)].map((m) => [m[1], m[2]]),
);

/** The block that matches every palette, where the chrome is derived. */
const derived = palettes.match(/\[data-sp-palette\]\s*\{([^}]*)\}/)?.[1] ?? "";

const declared = (block: string) => [...block.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)].map((m) => m[1]);

/** Each `[data-sp-palette][data-sp-ground="level"] { ... }` block, by level. */
const grounds = new Map<string, string>(
  [...palettes.matchAll(/\[data-sp-palette\]\[data-sp-ground="([a-z-]+)"\]\s*\{([^}]*)\}/g)].map((m) => [
    m[1],
    m[2],
  ]),
);

/** Every block a palette attribute can switch on, for the rules that hold of all of them. */
const allBlocks = (): (readonly [string, string])[] => [
  ...presets,
  ["derived chrome", derived] as const,
  ...[...grounds].map(([level, block]) => [`ground "${level}"`, block] as const),
];

describe("palettes", () => {
  it("ships more than one, or the feature is a claim rather than a demonstration", () => {
    expect(presets.size).toBeGreaterThan(1);
  });

  it("asks every preset the same questions", () => {
    // Drift here is the failure mode the whole file exists to catch: a preset
    // that omits one channel inherits the previous palette's light for it,
    // which looks like a rendering bug and is nearly impossible to spot by
    // eye against four other palettes.
    const sets = [...presets].map(([name, block]) => [name, declared(block).sort()] as const);
    const [, first] = sets[0];
    for (const [name, names] of sets) {
      expect(names, `palette "${name}" declares a different set of tokens`).toEqual(first);
    }
  });

  it("states its channels as bare rgb triples, so a component can vary the alpha", () => {
    // `rgb(var(--sp-rim-rgb) / 0.4)` only composes if the token holds
    // "150 190 255" and not "rgb(150 190 255)" or a hex.
    for (const [name, block] of presets) {
      for (const m of block.matchAll(/(--sp-[a-z-]+-rgb):\s*([^;]+);/g)) {
        expect(m[2].trim(), `${name} ${m[1]} must be three numbers`).toMatch(/^\d+ \d+ \d+$/);
      }
    }
  });

  it("re-points only tokens the library actually reads", () => {
    // A palette that invents a token paints nothing, and the mistake is
    // invisible until someone wonders why a preset looks unfinished.
    const known = new Set([...tokens.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)].map((m) => m[1]));
    for (const [name, block] of allBlocks()) {
      for (const token of declared(block)) {
        expect(known.has(token), `${name} declares ${token}, which tokens.css does not define`).toBe(true);
      }
    }
  });

  it("leaves contrast, status and data alone", () => {
    // The three things a brand hue has no business deciding. The neutral text
    // ramp carries the contrast guarantees; status colour means something; the
    // chart series are the measured colour-blind ramp documented in
    // tokens.css, where every adjacent pair clears ΔE 8.6 under protanopia.
    // A palette that moved any of them would break a promise made elsewhere.
    const forbidden = /^--sp-(gray-|success-|warning-|danger-|chart-series-|category-)/;
    for (const [name, block] of allBlocks()) {
      for (const token of declared(block)) {
        expect(forbidden.test(token), `${name} must not re-point ${token}`).toBe(false);
      }
    }
  });

  it("changes no spacing, size or duration", () => {
    // A palette is colour. Anything that moves layout belongs in the
    // consumer's own stylesheet, not in a palette they chose for its hue.
    for (const [name, block] of allBlocks()) {
      for (const token of declared(block)) {
        expect(/-(size|height|width|gap|radius|duration|max-height)$/.test(token), `${name}: ${token}`).toBe(false);
      }
    }
  });

  it("does not touch :root, so it costs a consumer nothing until they ask", () => {
    expect(palettes).not.toMatch(/(^|\s):root\s*[,{]/);
  });

  it("offers more than one ground, and each moves only the ground", () => {
    // The ground is a luminance axis, not a light mode. If a level started
    // re-pointing the glass or the text, it would be building the light theme
    // the library promises not to ship — and it would do it where nobody
    // thinks to look, in a preset named for brightness.
    expect(grounds.size).toBeGreaterThan(0);
    for (const [level, block] of grounds) {
      expect(declared(block), `ground "${level}"`).toEqual(["--sp-ground-color"]);
    }
  });
});
