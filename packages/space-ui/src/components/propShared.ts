// Shared prop plumbing for the design-system primitives. The spacing map is
// the single place Radix's numeric steps meet our t-shirt tokens; "3" (12px)
// rounds UP to md per the spec's when-in-doubt-go-up rule.
import type { CSSProperties } from "react";

export type SpaceStep = "0" | "1" | "2" | "3" | "4" | "5" | "6";

export interface SpacingProps {
  m?: SpaceStep;
  mt?: SpaceStep;
  mb?: SpaceStep;
  p?: SpaceStep;
  pb?: SpaceStep;
}

const SPACE: Record<SpaceStep, string> = {
  "0": "0",
  "1": "var(--spacing-xs)",
  "2": "var(--spacing-sm)",
  "3": "var(--spacing-md)",
  "4": "var(--spacing-md)",
  "5": "var(--spacing-lg)",
  "6": "var(--spacing-xl)",
};

export function spacingStyle(
  { m, mt, mb, p, pb }: SpacingProps,
  style?: CSSProperties,
): CSSProperties | undefined {
  const out: CSSProperties = {
    ...(m !== undefined && { margin: SPACE[m] }),
    ...(mt !== undefined && { marginTop: SPACE[mt] }),
    ...(mb !== undefined && { marginBottom: SPACE[mb] }),
    ...(p !== undefined && { padding: SPACE[p] }),
    ...(pb !== undefined && { paddingBottom: SPACE[pb] }),
    ...style,
  };
  return Object.keys(out).length > 0 ? out : undefined;
}

export function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
