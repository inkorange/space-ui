import type * as React from "react";
import { createElement, forwardRef, type ReactNode } from "react";
import { cx, spacingStyle, type SpacingProps } from "./propShared";
import styles from "./Text.module.scss";

export interface TextProps
  extends SpacingProps,
    Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  as?: "span" | "div" | "p" | "label";
  size?: "1" | "2" | "3" | "4" | "5" | "6";
  weight?: "medium" | "bold";
  color?: "gray" | "red" | "green" | "amber";
  htmlFor?: string; // when as="label"
  children?: ReactNode;
}

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { as = "span", size, weight, color, className, style, m, mt, mb, p, pb, ...rest },
  ref,
) {
  return createElement(as, {
    ...rest,
    ref,
    className: cx(
      styles.text,
      size && styles[`size${size}`],
      weight && styles[weight],
      color && styles[`color${color[0].toUpperCase()}${color.slice(1)}`],
      className,
    ),
    style: spacingStyle({ m, mt, mb, p, pb }, style),
  });
});
