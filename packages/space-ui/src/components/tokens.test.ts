// Guards the design-token contract: every token the design system promises
// exists in tokens.css. Extended in phase-1's final task to also ban Radix
// variables from our SCSS.
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const TOKENS_PATH = path.join(__dirname, "..", "styles", "tokens.css");

export const EXPECTED_TOKENS = [
  "--sp-gray-text", "--sp-gray-text-dim", "--sp-gray-muted",
  "--sp-gray-border", "--sp-gray-surface", "--sp-gray-panel", "--sp-gray-track",
  "--sp-blue-2", "--sp-blue-8", "--sp-blue-9", "--sp-blue-11", "--sp-blue-12",
  "--sp-blue-a2", "--sp-blue-a3", "--sp-blue-a6",
  "--sp-amber-10", "--sp-amber-11",
  "--sp-green-9", "--sp-green-11", "--sp-green-a3", "--sp-green-a6",
  "--sp-red-9",
  "--sp-red-11",
  "--sp-violet-11",
  "--sp-yellow-9",
  "--sp-orange-9",
  "--spacing-xs", "--spacing-sm", "--spacing-md", "--spacing-lg", "--spacing-xl",
  "--sp-font-xs", "--sp-font-sm", "--sp-font-md", "--sp-font-xl",
];

describe("design tokens", () => {
  const css = readFileSync(TOKENS_PATH, "utf8");

  it("defines every promised token exactly once", () => {
    for (const token of EXPECTED_TOKENS) {
      const defs = css.match(new RegExp(`${token}\\s*:`, "g")) ?? [];
      expect(defs, `${token} should be defined exactly once`).toHaveLength(1);
    }
  });

  it("defines no tokens outside the promised set", () => {
    const defined = [...css.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)].map((m) => m[1]);
    expect(new Set(defined)).toEqual(new Set(EXPECTED_TOKENS));
  });

  it("keeps spacing on the 8pt grid (4px allowed as the half-step xs)", () => {
    const spacing = [...css.matchAll(/--spacing-[a-z]+:\s*(\d+)px/g)].map((m) => Number(m[1]));
    expect(spacing.length).toBe(5);
    for (const px of spacing) expect(px === 4 || px % 8 === 0).toBe(true);
  });

  const SCSS_ROOT = path.join(__dirname, "..");
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(dir, e.name);
      // .test.ts(x) files are excluded: their sources legitimately mention old
      // Radix var names and token names in fixtures/regex source, not real usage.
      if (/\.test\.(ts|tsx)$/.test(e.name)) return [];
      return e.isDirectory() ? walk(p) : /\.(scss|css|tsx|ts)$/.test(e.name) && !p.endsWith("tokens.css") ? [p] : [];
    });

  it("every --sp-*/--spacing-* var referenced in styles is a defined token", () => {
    for (const file of walk(SCSS_ROOT)) {
      const used = [...readFileSync(file, "utf8").matchAll(/var\((--(?:sp|spacing)-[a-zA-Z0-9-]+)\)/g)].map((m) => m[1]);
      for (const token of used) {
        expect(EXPECTED_TOKENS, `${file} uses undefined token ${token}`).toContain(token);
      }
    }
  });

  it("no Radix design variables remain in our styles", () => {
    // --radix-select-trigger-width is a Radix Select internal, allowed until Phase 3.
    const banned = /var\(--(gray|slate|blue|amber|green|yellow|orange|violet|cyan|red|accent|space|font-size|color-panel|default-font-family)[a-zA-Z0-9-]*\s*[,)]/;
    for (const file of walk(SCSS_ROOT)) {
      const hits = readFileSync(file, "utf8").match(new RegExp(banned, "g")) ?? [];
      expect(hits, `${file} still references Radix vars: ${hits.join(", ")}`).toHaveLength(0);
    }
  });
});
