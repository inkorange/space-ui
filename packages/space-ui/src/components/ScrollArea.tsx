import type * as React from "react";
import { forwardRef, type ReactNode } from "react";
import { cx } from "./propShared";
import styles from "./ScrollArea.module.scss";

// Plain overflow container. ConfigurationPanel's scrollViewport() helper
// queries [data-radix-scroll-area-viewport] and falls back to the element
// itself — with this component the ref IS the viewport, so the fallback path
// serves it (verified before migration).
export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The scrollable content. */
  children?: ReactNode;
}

/**
 * A region that scrolls independently of the page, with the scrollbar styled
 * to match the dark surface rather than the browser default.
 *
 * Needs a bounded height from its parent or its context — without one there
 * is nothing to scroll against.
 */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { className, ...rest },
  ref,
) {
  return <div {...rest} ref={ref} className={cx(styles.scrollArea, className)} />;
});
