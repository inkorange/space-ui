import type * as React from "react";
import { forwardRef, type ReactNode } from "react";
import { cx, spacingStyle, type SpacingProps } from "./propShared";
import styles from "./Card.module.scss";

export interface CardProps extends SpacingProps, React.HTMLAttributes<HTMLDivElement> {
  /** The card's contents. */
  children?: ReactNode;
}

/**
 * A translucent panel for grouping related content, one step above the page
 * surface. Its 12px inset is a deliberate exception to the 8pt grid, kept for
 * parity with the app this was extracted from.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, style, m, mt, mb, p, pb, ...rest },
  ref,
) {
  return (
    <div
      {...rest}
      ref={ref}
      className={cx(styles.card, className)}
      style={spacingStyle({ m, mt, mb, p, pb }, style)}
    />
  );
});
