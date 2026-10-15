/**
 * What the library says about itself, as a test.
 *
 * Every component's JSDoc is published three times over: into the shipped
 * `.d.ts` files, into the gallery's prop tables, and into the `llms.txt` and
 * `reference.html` that the docs site generates for readers that do not run
 * JavaScript. That makes a component's doc comment public copy, and gives it
 * two obligations a comment normally does not have.
 *
 * It has to exist. Seven components — Select, Dialog, Tabs among them — once
 * shipped with no description at all, so the reference said nothing about the
 * controls people reach for first.
 *
 * And it has to be written for a stranger. These comments carry the history of
 * an extraction: the app the library came out of, and the component library it
 * replaced. Neither means anything to a reader who installed this from npm,
 * and an internal name in published documentation is a leak.
 *
 * Only doc comments are checked. A `//` comment is for whoever opens the file
 * and may say whatever is true.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const dir = __dirname;

const sources = readdirSync(dir)
  .filter((f) => f.endsWith(".tsx") && !f.includes(".test.") && f !== "icons.tsx")
  .map((f) => ({ file: f, base: f.replace(/\.tsx$/, ""), code: readFileSync(path.join(dir, f), "utf8") }));

/**
 * Names that belong to the private history of this code, not to the library.
 * `Radix` is the component library SpaceUI replaced; the rest are screens and
 * concepts from the application it was extracted from.
 */
const INTERNAL = ["Radix", "planet-builder", "SurfaceView", "orrery", "planet card"];

/** Every `/** … *\/` block in a file, with the line it starts on. */
const docComments = (code: string): Array<{ text: string; line: number }> =>
  [...code.matchAll(/\/\*\*[\s\S]*?\*\//g)].map((m) => ({
    text: m[0],
    line: code.slice(0, m.index).split("\n").length,
  }));

/**
 * The doc comment attached to a declaration, i.e. the last one before it with
 * nothing but blank lines and `//` comments in between. This is the same rule
 * TypeScript uses to decide what goes into a `.d.ts`, which is the point: a
 * description separated from its declaration by a stray `const` is a
 * description nobody will ever read. Autocomplete's was, for a while.
 */
const attachedDoc = (code: string, declaration: RegExp): string | null => {
  const m = code.match(declaration);
  if (!m || m.index === undefined) return null;
  const before = code.slice(0, m.index).trimEnd();
  if (!before.endsWith("*/")) {
    // A `//` note may sit between the doc and the declaration.
    const lines = before.split("\n");
    while (lines.length && /^\s*\/\//.test(lines[lines.length - 1])) lines.pop();
    const trimmed = lines.join("\n").trimEnd();
    if (!trimmed.endsWith("*/")) return null;
    return trimmed.slice(trimmed.lastIndexOf("/**"));
  }
  return before.slice(before.lastIndexOf("/**"));
};

/** The prose of a doc comment, with the markers and any `@tags` taken off. */
const prose = (doc: string): string =>
  doc
    .replace(/^\/\*\*|\*\/$/g, "")
    .split("\n")
    .map((l) => l.replace(/^\s*\*\s?/, ""))
    .join(" ")
    .split(/\s@[a-z]+\s/)[0]
    .replace(/\s+/g, " ")
    .trim();

describe("published documentation", () => {
  it("gives every component a description a stranger could use", () => {
    const silent: string[] = [];

    for (const { file, base, code } of sources) {
      // The root export is named after its file, as either a function, a
      // forwardRef, or an Object.assign carrying the component's parts.
      const declaration = new RegExp(
        `^export (?:function ${base}\\b|const ${base}\\s*=)`,
        "m",
      );
      if (!declaration.test(code)) continue;

      const doc = attachedDoc(code, declaration);
      const text = doc ? prose(doc) : "";
      // Long enough to say what the thing is and when to reach for it. The
      // shortest that passes today is Badge's, at just over 200 characters.
      if (text.length < 80) silent.push(`${file}: ${text ? `only "${text}"` : "no description"}`);
    }

    expect(silent).toEqual([]);
  });

  it("keeps internal names out of the documentation it publishes", () => {
    const leaks: string[] = [];

    for (const { file, code } of sources) {
      for (const { text, line } of docComments(code)) {
        for (const name of INTERNAL) {
          if (text.toLowerCase().includes(name.toLowerCase())) {
            leaks.push(`${file}:${line} mentions "${name}" in a doc comment`);
          }
        }
      }
    }

    expect(leaks).toEqual([]);
  });
});
