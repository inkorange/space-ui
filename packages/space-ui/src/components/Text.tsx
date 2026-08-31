import type * as React from "react";
import { createElement, forwardRef, type ReactNode } from "react";
import { cx, spacingStyle, type SpacingProps } from "./propShared";
import styles from "./Text.module.scss";

export interface TextProps
  extends SpacingProps,
    Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  /** Element to render. Default `span`. Use `p` for prose and `label`
   *  (with `htmlFor`) for form labels — size is presentational, so the
   *  element stays free to be the semantically correct one. */
  as?: "span" | "div" | "p" | "label";
  /** Font size step: 1=12px, 2=14px, 3=16px, 4=18px, 5=20px, 6=24px.
   *  Line height and letter spacing move with it. Omit to inherit. */
  size?: "1" | "2" | "3" | "4" | "5" | "6";
  /** 500 or 700. Omit for the inherited weight. */
  weight?: "medium" | "bold";
  /** Semantic colour role. `gray` is the standard secondary-text token;
   *  the rest carry meaning, so avoid them for emphasis alone. Omit for
   *  primary text. */
  /** Semantic colour role. `muted` is the standard secondary-text token;
   *  the rest carry meaning, so avoid them for emphasis alone. Omit for
   *  primary text. */
  color?: "muted" | "danger" | "success" | "warning";
  /** Id of the control this labels. Only meaningful with `as="label"`. */
  htmlFor?: string;
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
