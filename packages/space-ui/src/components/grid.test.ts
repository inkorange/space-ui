/**
 * The spacing grid, as a test rather than a habit.
 *
 * Every gap, margin and padding in the library is a whole multiple of 8px —
 * or of 4px inside a small, dense part, where a whole unit would make a chip
 * or a menu row bigger than it should be. Anything else has to earn its place
 * in EXCEPTIONS below, with a reason.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const SPACING = new Set([
  "margin", "margin-top", "margin-bottom", "margin-left", "margin-right",
  "margin-block", "margin-inline", "margin-block-start", "margin-block-end",
  "margin-inline-start", "margin-inline-end",
  "padding", "padding-top", "padding-bottom", "padding-left", "padding-right",
  "padding-block", "padding-inline", "padding-block-start", "padding-block-end",
  "padding-inline-start", "padding-inline-end",
  "gap", "row-gap", "column-gap",
]);

/**
 * Values that are not spacing at all, and so are not on the grid: a hairline,
 * a mask inset, an optical nudge onto a line of text. Each is keyed by file
 * and value so a NEW off-grid value cannot hide behind an old exception.
 */
const EXCEPTIONS: Record<string, string> = {
  "components/Button.module.scss:1": "the conic rim's mask inset — a border's width, not a gap",
  "components/Chart.module.scss:-1": "the one-pixel clip that hides the data table from sight but not from screen readers",
  "components/Checkbox.module.scss:2": "centres the tile on the first line of its label, where the lh unit is unsupported",
  "components/RadioGroup.module.scss:2": "the same optical nudge as Checkbox",
  "components/Tabs.module.scss:1": "the border an active tab gives up, added back as padding so it does not jump",
  "components/Tabs.module.scss:-1": "overlaps the panel's top border so the two connect",
};

const dir = path.join(__dirname, "..");
const files = (function walk(at: string): string[] {
  return readdirSync(at, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(at, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(scss|css)$/.test(entry.name) ? [full] : [];
  });
})(dir);

describe("the spacing grid", () => {
  it("names a spacing step rather than writing a raw length", () => {
    // Spacing is --spacing-xs … --spacing-2xl, each one a multiple of
    // --sp-grid-base-size. A raw px gap or inset cannot be retuned by the
    // consumer and drifts off the rhythm the moment someone types 10.
    const strays: string[] = [];

    for (const file of files) {
      const name = path.relative(dir, file);
      readFileSync(file, "utf8").split("\n").forEach((raw, i) => {
        const line = raw.split("//")[0];
        const match = /^\s*([a-z-]+)\s*:\s*([^;{]+);/.exec(line);
        if (!match || !SPACING.has(match[1])) return;

        for (const found of match[2].matchAll(/(-?\d+(?:\.\d+)?)px/g)) {
          const value = Number(found[1]);
          if (value === 0) continue;
          if (EXCEPTIONS[`${name}:${value}`]) continue;
          strays.push(`${name}:${i + 1}  ${match[1]}: ${match[2].trim()}`);
        }
      });
    }

    expect(strays).toEqual([]);
  });

  it("keeps the control ladder on the grid", () => {
    // The two full-size steps are whole units. The small one is allowed the
    // half-step, for the same reason a Badge is: at 32px the label is pinched
    // against the rim, and 40px is not a small control any more.
    const tokens = readFileSync(path.join(dir, "styles/tokens.css"), "utf8");
    const height = (token: string) => {
      const found = new RegExp(`${token}:\\s*(\\d+)px`).exec(tokens);
      expect(found, `${token} is missing`).not.toBeNull();
      return Number(found![1]);
    };
    expect(height("--sp-control-height") % 8).toBe(0);
    expect(height("--sp-control-height-lg") % 8).toBe(0);
    expect(height("--sp-control-height-sm") % 4).toBe(0);
  });

  it("sizes type in rem, so it answers to the reader's own text size", () => {
    // px ignores a reader who has set their browser's text larger. Sizes are
    // written in px in the source and converted — see styles/_type.scss — so
    // what this catches is a literal px size that skipped the helper.
    const strays: string[] = [];
    for (const file of files) {
      const name = path.relative(dir, file);
      if (name === "styles/_type.scss") continue;
      readFileSync(file, "utf8").split("\n").forEach((raw, i) => {
        const line = raw.split("//")[0];
        const match = /^\s*(font-size|line-height|font)\s*:\s*([^;{]+);/.exec(line);
        if (!match) return;
        if (/\d+(\.\d+)?px/.test(match[2])) strays.push(`${name}:${i + 1}  ${match[1]}: ${match[2].trim()}`);
      });
    }
    expect(strays).toEqual([]);
  });

  it("keeps the type scale tokens in rem too", () => {
    const tokens = readFileSync(path.join(dir, "styles/tokens.css"), "utf8");
    for (const token of ["--sp-font-xs", "--sp-font-sm", "--sp-font-md", "--sp-font-xl"]) {
      const value = new RegExp(`${token}:\\s*([^;]+);`).exec(tokens);
      expect(value, `${token} is missing`).not.toBeNull();
      expect(value![1].trim(), `${token} is ${value![1]}`).toMatch(/rem$/);
    }
  });

  it("does not let an exception be claimed by a file that no longer needs it", () => {
    // An exception left behind after the value it excused has gone is a
    // licence nobody is using, and the next stray value inherits it.
    const unused: string[] = [];
    for (const key of Object.keys(EXCEPTIONS)) {
      const [name, value] = key.split(":");
      const source = readFileSync(path.join(dir, name), "utf8");
      if (!source.includes(`${value}px`)) unused.push(key);
    }
    expect(unused).toEqual([]);
  });
});
