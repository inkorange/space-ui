import type * as React from "react";
import { forwardRef, type ReactNode } from "react";
import { cx } from "./propShared";
import styles from "./ScrollArea.module.scss";

// Plain overflow container. ConfigurationPanel's scrollViewport() helper
// queries [data-radix-scroll-area-viewport] and falls back to the element
// itself — with this component the ref IS the viewport, so the fallback path
// serves it (verified before migration).
export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { className, ...rest },
  ref,
) {
  return <div {...rest} ref={ref} className={cx(styles.scrollArea, className)} />;
});
