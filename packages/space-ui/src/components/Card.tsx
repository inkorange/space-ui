import type * as React from "react";
import { forwardRef, type ReactNode } from "react";
import { cx, spacingStyle, type SpacingProps } from "./propShared";
import styles from "./Card.module.scss";

export interface CardProps extends SpacingProps, React.HTMLAttributes<HTMLDivElement> {
  /** A media element to sit at the top of the card, full-bleed to its edges.
   *  Pass whatever your framework renders — a plain `<img>`, a `next/image`,
   *  a `<video>` — and the card frames it: cropped to fill, top corners
   *  matched to its own radius, and a reserved box so the layout does not
   *  jump when it loads.
   *
   *  The reserved box is `--sp-card-image-ratio` (default `16 / 10`). Set it
   *  per card for a different crop. */
  image?: ReactNode;
  /** The card's contents. */
  children?: ReactNode;
}

/**
 * A translucent panel for grouping related content, one step above the page
 * surface. Its 12px inset is a deliberate exception to the 8pt grid, kept for
 * parity with the app this was extracted from.
 *
 * Pass `image` for a media card. The image is framed by the card rather than
 * being an ordinary child, so every card in a row reserves the same box
 * before its image loads and none of them reflow when it does.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, style, image, children, m, mt, mb, p, pb, ...rest },
  ref,
) {
  return (
    <div
      {...rest}
      ref={ref}
      className={cx(styles.card, image != null && styles.hasImage, className)}
      style={spacingStyle({ m, mt, mb, p, pb }, style)}
    >
      {image != null && <div className={styles.image}>{image}</div>}
      {children}
    </div>
  );
});
