import type * as React from "react";
import { createElement, forwardRef, type ReactNode } from "react";
import { cx, spacingStyle, type SpacingProps } from "./propShared";
import styles from "./Heading.module.scss";

export interface HeadingProps
  extends SpacingProps,
    Omit<React.HTMLAttributes<HTMLHeadingElement>, "color"> {
  as?: "h1" | "h2" | "h3" | "h4";
  size?: "4" | "5" | "6" | "7" | "8" | "9";
  color?: "gray" | "red";
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
      color === "gray" && styles.colorGray,
      color === "red" && styles.colorRed,
      align === "center" && styles.alignCenter,
      className,
    ),
    style: spacingStyle({ m, mt, mb, p, pb }, style),
  });
});
