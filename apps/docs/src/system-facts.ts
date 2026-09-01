import * as UI from "@inkorange/space-ui";
import { iconNames as generatedIconNames } from "virtual:space-docs";
import pkg from "../../../packages/space-ui/package.json";
import measured from "./measured.json";

/**
 * Facts the gallery states publicly, derived from the library rather than
 * typed in by hand. A docs site that quotes a stale component count is a docs
 * site nobody trusts, so anything that CAN be counted is counted. Values that
 * can't be (the npm status, the release version) are declared once, here, and
 * read by every surface that shows them.
 */

const runtimeExports = Object.keys(UI).filter((name) => /^[A-Z]/.test(name));

/**
 * Icon names come from parsing icons.tsx at build time, NOT from a
 * `endsWith("Icon")` test: `Pencil` and `Share` are icons without the suffix,
 * so the heuristic both undercounts the icons and files those two under
 * components.
 */
export const iconNames = generatedIconNames;

/**
 * Exported components, counting a namespace (Select, Dialog, …) as the one
 * component it presents to the consumer.
 */
export const componentNames = runtimeExports.filter(
  (name) => !iconNames.includes(name),
);

export const componentCount = componentNames.length;
export const iconCount = iconNames.length;

/**
 * Read from the package rather than typed here. It was pinned to "1.0.0" by
 * hand and the sidebar still claimed that at 1.0.3 — the exact stale-fact
 * problem the rest of this file exists to avoid. changesets bumps
 * package.json on release, so this follows automatically.
 */
export const version = pkg.version;

/** Published state. 1.0.0 went to npm on 2026-08-31. */
export const isPublished = true;

/**
 * Measured, not counted and not typed in: written by
 * packages/space-ui/scripts/badges.mjs from a real build and a real coverage
 * run, and re-checked by that script in CI. The README's badges read the same
 * two numbers, so the site and the readme cannot disagree.
 */
export const minzipKb = measured.minzipKb;
export const coveragePct = measured.coverageStatementsPct;

export const packageName = "@inkorange/space-ui";
export const repoUrl = "https://github.com/inkorange/space-ui";
