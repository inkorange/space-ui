import type * as React from "react";
import { forwardRef, type ReactNode } from "react";
import { spacingStyle, type SpacingProps } from "./propShared";

export interface BoxProps extends SpacingProps, React.HTMLAttributes<HTMLDivElement> {
  /** Anything. Box adds no styling of its own. */
  children?: ReactNode;
}

// Radix Box at our call sites is a plain div carrying className/style/ref —
// no layout props anywhere (verified by inventory). Keep it exactly that.

/**
 * A plain div that understands the spacing scale. The escape hatch for when
 * you need margin or padding on the grid but no layout behaviour with it.
 *
 * Renders nothing of its own — no class, no styling — so it never interferes
 * with whatever you put inside.
 */
export const Box = forwardRef<HTMLDivElement, BoxProps>(function Box(
  { style, m, mt, mb, p, pb, ...rest },
  ref,
) {
  return <div {...rest} ref={ref} style={spacingStyle({ m, mt, mb, p, pb }, style)} />;
});
