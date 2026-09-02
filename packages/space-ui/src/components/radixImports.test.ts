/**
 * Permanent guard: Radix is fully removed from this codebase (phase 5). No
 * app code may import from any @radix-ui/* package again, and the packages
 * must never reappear in package.json.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const MIGRATED_BANNED = [
  "Text", "Heading", "Link", "Flex", "Box", "Grid",
  "Badge", "Separator", "Card",
  "Select", "TextField", "TextArea", "Slider", "RadioGroup", "Progress",
  "Dialog", "AlertDialog", "DropdownMenu", "Tabs",
];

const SRC = path.join(__dirname, "..");
const ROOT = path.join(__dirname, "..", "..");
const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) ? [p] : [];
  });

describe("radix import guard", () => {
  it("no migrated component is imported from @radix-ui/themes", () => {
    for (const file of walk(SRC)) {
      const src = readFileSync(file, "utf8");
      // Capture every named-import/re-export block from @radix-ui/themes
      // (multiline). Covers type-only imports (`import type { Flex }`),
      // mixed default+named (`import Theme, { Text }`), and re-exports
      // (`export { Text } from "@radix-ui/themes"`).
      // Named-import/export lists can never contain a literal `}`, so a
      // negated-class capture can't glue two unrelated import statements
      // together the way a lazy [\s\S]*? can when a preceding import also
      // ends in `}` on the way to this one's "from ...@radix-ui/themes".
      const blocks = [
        ...src.matchAll(
          /(?:import|export)\s+(?:type\s+)?(?:[\w$]+\s*,\s*)?\{([^}]*)\}\s*from\s*["']@radix-ui\/themes["']/g,
        ),
      ];
      for (const b of blocks) {
        const names = b[1].split(",").map((s) => s.trim().split(/\s+as\s+/)[0]).filter(Boolean);
        const banned = names.filter((n) => MIGRATED_BANNED.includes(n));
        expect(banned, `${file} imports migrated components from Radix: ${banned.join(", ")}`).toHaveLength(0);
      }
    }
  });

  it("no non-test src file imports from any @radix-ui/* package", () => {
    // Total ban: Radix is fully removed. Catches the quoted module specifier
    // "@radix-ui/<anything>" anywhere in the file, so it's immune to
    // import-form variations (named, type-only, namespace `import * as`,
    // re-export, side-effect `import "..."`, dynamic import(), multiline).
    const RADIX_SPECIFIER = /["']@radix-ui\/[^"']+["']/;
    for (const file of walk(SRC)) {
      const src = readFileSync(file, "utf8");
      const hasRadixImport = RADIX_SPECIFIER.test(src);
      expect(hasRadixImport, `${file} contains a quoted @radix-ui/* module specifier (Radix is fully removed)`).toBe(false);
    }
  });

  it("package.json has no @radix-ui/* dependency", () => {
    const pkg = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8"));
    const depGroups = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];
    const offenders: string[] = [];
    for (const group of depGroups) {
      const deps = pkg[group];
      if (!deps) continue;
      for (const name of Object.keys(deps)) {
        if (name.startsWith("@radix-ui/")) offenders.push(`${group}.${name}`);
      }
    }
    expect(offenders, `package.json still declares @radix-ui/* dependencies: ${offenders.join(", ")}`).toHaveLength(0);
  });
});
