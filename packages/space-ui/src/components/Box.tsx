import type * as React from "react";
import { forwardRef, type ReactNode } from "react";
import { spacingStyle, type SpacingProps } from "./propShared";

export interface BoxProps extends SpacingProps, React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

// Radix Box at our call sites is a plain div carrying className/style/ref —
// no layout props anywhere (verified by inventory). Keep it exactly that.

export const Box = forwardRef<HTMLDivElement, BoxProps>(function Box(
  { style, m, mt, mb, p, pb, ...rest },
  ref,
) {
  return <div {...rest} ref={ref} style={spacingStyle({ m, mt, mb, p, pb }, style)} />;
});
