import * as UI from "@inkorange/space-ui";
import { iconNames as generatedIconNames } from "virtual:space-docs";

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
 * The version the first publish will carry. The package sits at 0.0.0 with a
 * staged major changeset, so changesets resolves it to 1.0.0 on release.
 */
export const version = "1.0.0";

/** Published state. Flip to `true` on the first successful npm publish. */
export const isPublished = false;

export const packageName = "@inkorange/space-ui";
export const repoUrl = "https://github.com/inkorange/space-ui";
