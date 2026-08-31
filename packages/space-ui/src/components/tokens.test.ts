// Guards the design-token contract: every token the design system promises
// exists in tokens.css. Extended in phase-1's final task to also ban Radix
// variables from our SCSS.
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const TOKENS_PATH = path.join(__dirname, "..", "styles", "tokens.css");

export const EXPECTED_TOKENS = [
  // Grays are role-named: what the colour is FOR, not where it sits on a ramp.
  "--sp-gray-text", "--sp-gray-text-dim", "--sp-gray-muted",
  "--sp-gray-border", "--sp-gray-surface", "--sp-gray-panel", "--sp-gray-track",
  // Accents run on two axes. Emphasis:
  "--sp-primary-deep", "--sp-primary-border", "--sp-primary-solid", "--sp-primary-text", "--sp-primary-soft", "--sp-primary-glow",
  // and status:
  "--sp-success-solid", "--sp-success-text", "--sp-success-soft", "--sp-warning-text", "--sp-danger-text",
  "--sp-accent-text",
  "--sp-muted-soft", "--sp-danger-soft", "--sp-warning-soft", "--sp-accent-soft",
  "--sp-on-solid",
  // Component sizing
  "--sp-control-height",
  "--sp-select-trigger-max-width", "--sp-select-panel-max-width",
  // Component colours
  "--sp-select-panel-color",
  "--sp-tabs-surface-color",
  "--sp-tabs-rest-from-color", "--sp-tabs-rest-to-color",
  "--sp-tabs-hover-from-color", "--sp-tabs-hover-to-color",
  "--sp-tabs-active-from-color", "--sp-tabs-active-edge-color",
  "--sp-radio-group-orb-highlight-color", "--sp-radio-group-orb-mid-color",
  "--sp-radio-group-orb-rim-color", "--sp-radio-group-orb-glow-color",
  "--sp-radio-group-orb-halo-color",
  "--sp-icon-toggle-label-color", "--sp-icon-toggle-label-dim-color",
  "--sp-icon-toggle-active-from-color", "--sp-icon-toggle-active-rim-color",
  "--sp-icon-toggle-active-to-color",
  "--sp-slider-thumb-highlight-color", "--sp-slider-thumb-mid-color",
  "--sp-slider-thumb-shade-color", "--sp-slider-thumb-limb-color",
  "--sp-slider-thumb-rim-color", "--sp-slider-thumb-rim-hover-color",
  "--sp-slider-thumb-glow-hover-color", "--sp-slider-range-from-color",
  "--sp-panel-item-highlight-color",
  // Categorical — hue is the identity, so these keep hue names.
  "--sp-category-cyan-soft", "--sp-category-cyan-text",
  "--sp-category-purple-soft", "--sp-category-purple-text",
  "--sp-category-orange-soft", "--sp-category-orange-text",
  "--sp-category-yellow-soft", "--sp-category-yellow-text",
  // Lit-glass surfaces, stored as channels so alpha stays local.
  "--sp-glass-rgb", "--sp-glass-deep-rgb", "--sp-sheen-rgb", "--sp-rim-rgb",
  "--sp-glow-rgb", "--sp-glint-rgb", "--sp-star-rgb", "--sp-shadow-rgb",
  "--sp-glass-text", "--sp-focus-ring",
  "--sp-ember-glass-rgb", "--sp-ember-glass-deep-rgb", "--sp-ember-sheen-rgb",
  "--sp-ember-rim-rgb", "--sp-ember-glow-rgb",
  "--spacing-xs", "--spacing-sm", "--spacing-md", "--spacing-lg", "--spacing-xl",
  "--sp-font-xs", "--sp-font-sm", "--sp-font-md", "--sp-font-xl",
  "--sp-font-family",
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

  // Two kinds of --sp-* name exist: the global palette promised above, and
  // component tokens like --sp-loader-moon-size, which live in the component's
  // own stylesheet by design. A component token is only safe if it carries a
  // fallback — without one, a consumer who never sets it gets an empty value
  // and the component renders broken.
  it("every --sp-*/--spacing-* var is a promised token, or a component token with a fallback", () => {
    for (const file of walk(SCSS_ROOT)) {
      const css = readFileSync(file, "utf8");
      for (const m of css.matchAll(/var\(\s*(--(?:sp|spacing)-[a-zA-Z0-9-]+)\s*(,?)/g)) {
        const [, token, comma] = m;
        if ((EXPECTED_TOKENS as readonly string[]).includes(token)) continue;
        expect(
          comma,
          `${file}: ${token} is not a promised token, so it must declare a fallback`,
        ).toBe(",");
      }
    }
  });

  // No component may pin a typeface of its own: the font is a system decision
  // made once in tokens.css. This caught SpaceButton reading --font-roboto.
  it("no component introduces its own font hook", () => {
    for (const file of walk(SCSS_ROOT)) {
      const css = readFileSync(file, "utf8");
      const hooks = [...css.matchAll(/var\(\s*(--[a-zA-Z0-9-]*font[a-zA-Z0-9-]*)/g)]
        .map((m) => m[1])
        .filter((t) => t !== "--sp-font-family" && !/^--sp-font-(xs|sm|md|xl)$/.test(t));
      expect(hooks, `${file} defines its own font hook: ${hooks.join(", ")}`).toHaveLength(0);
    }
  });

  // The whole theming model rests on this: styles.css must carry default
  // values, so a consumer who never supplies a token file still gets a working
  // library, and supplying one is a swap rather than a requirement.
  it("ships default token values with the components", () => {
    const entry = readFileSync(path.join(__dirname, "..", "index.ts"), "utf8");
    expect(entry, "index.ts must import tokens.css so styles.css carries the defaults")
      .toMatch(/import\s+["']\.\/styles\/tokens\.css["']/);
  });

  it("component tokens follow --sp-<component>-<modifier>-<type>", () => {
    const TYPES = ["size", "color", "timer", "angle", "width", "height"];
    for (const file of walk(SCSS_ROOT)) {
      const css = readFileSync(file, "utf8");
      for (const m of css.matchAll(/var\(\s*(--sp-[a-zA-Z0-9-]+)\s*,/g)) {
        const token = m[1];
        if ((EXPECTED_TOKENS as readonly string[]).includes(token)) continue;
        const parts = token.replace("--sp-", "").split("-");
        expect(
          parts.length >= 2 && TYPES.includes(parts[parts.length - 1]),
          `${file}: ${token} must end in one of ${TYPES.join(", ")}`,
        ).toBe(true);
      }
    }
  });

  // A raw colour in a component stylesheet is a value no theme can reach, which
  // breaks the promise that swapping one token file restyles everything.
  it("component styles contain no raw colour literals", () => {
    for (const file of walk(SCSS_ROOT)) {
      if (!file.endsWith(".scss")) continue;
      const offenders = readFileSync(file, "utf8")
        .split("\n")
        .map((line, i) => [line, i + 1] as const)
        // Mask stencils read only the alpha channel — not a themeable colour.
        .filter(([line]) => !/mask/.test(line))
        .filter(([line]) => /#[0-9a-fA-F]{3,8}\b|rgba?\(\s*\d/.test(line))
        .map(([line, n]) => `${n}: ${line.trim()}`);
      expect(offenders, `${file} has raw colours:\n${offenders.join("\n")}`).toHaveLength(0);
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
