import type * as React from "react";
import { createElement, forwardRef, type ReactNode } from "react";
import { cx, spacingStyle, type SpacingProps } from "./propShared";
import styles from "./Heading.module.scss";

export interface HeadingProps
  extends SpacingProps,
    Omit<React.HTMLAttributes<HTMLHeadingElement>, "color"> {
  /** Heading level to render. Default `h2`. Independent of `size`, so
   *  document outline stays correct without dictating appearance. */
  as?: "h1" | "h2" | "h3" | "h4";
  /** Font size step: 4=18px, 5=20px, 6=24px, 7=28px, 8=35px, 9=60px.
   *  Shares steps 4–6 with Text, so a Heading and Text can sit on the
   *  same line and match. */
  size?: "4" | "5" | "6" | "7" | "8" | "9";
  /** Semantic colour role. Omit for primary heading colour. */
  color?: "muted" | "danger";
  /** Centres the text. There is no `left`/`right` — headings are
   *  start-aligned unless deliberately centred. */
  align?: "center";
  children?: ReactNode;
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { as = "h2", size, color, align, className, style, m, mt, mb, p, pb, ...rest },
  ref,
) {
  return createElement(as, {
    ...rest,
    ref,
    className: cx(
      styles.heading,
      size && styles[`size${size}`],
      color === "muted" && styles.colorMuted,
      color === "danger" && styles.colorDanger,
      align === "center" && styles.alignCenter,
      className,
    ),
    style: spacingStyle({ m, mt, mb, p, pb }, style),
  });
});
