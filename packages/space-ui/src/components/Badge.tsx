import type * as React from "react";
import { forwardRef, type ReactNode } from "react";
import { cx, spacingStyle, type SpacingProps } from "./propShared";
import styles from "./Badge.module.scss";

/**
 * Roles whose colour carries meaning — status and emphasis.
 */
export type BadgeSemanticColor =
  | "muted"
  | "primary"
  | "success"
  | "warning"
  | "danger";

/**
 * Categorical hues for telling data apart — star classes, planet types — where
 * the colour distinguishes rather than signals. These deliberately keep hue
 * names: for a categorical scale the hue IS the identity, and calling one
 * "tertiary" would imply a ranking that does not exist.
 */
export type BadgeCategoricalColor =
  | "cyan"
  | "purple"
  | "orange"
  | "yellow"
  | "accent";

export type BadgeColor = BadgeSemanticColor | BadgeCategoricalColor;

export interface BadgeProps
  extends SpacingProps,
    Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Semantic role or categorical hue. Roles carry meaning — pick one
   *  that matches the state, not the look you want.
   */
  color?: BadgeColor;
  /** `soft` is a tinted wash for dense lists; `solid` is a filled chip
   *  for a badge that must win attention.
   */
  variant?: "soft" | "solid";
  /** 1 is the default chip; 2 is for standalone use away from body text. */
  size?: "1" | "2";
  /** Badges are single-line by default (Radix parity). Long free-text
   *  content — e.g. user-named star systems on planet cards — opts into
   *  wrapping so it can't overflow its card. */
  wrap?: boolean;
  /** Label text. Keep it short — a badge that wraps stops reading as one. */
  children?: ReactNode;
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

// Default color is "blue" (not "gray") to match Radix's behavior: Badge's
// `color` prop had no hardcoded default there either — it inherited the
// surrounding Theme's `accentColor`, which this app sets to "blue" (see the
// single <Theme accentColor> in the host app). A caller that wants a
// neutral badge should pass color="muted" explicitly.
/**
 * A compact status label. Colour is the message, so choose it for meaning:
 * the semantic roles say safe, pending or destructive, while the categorical
 * hues only tell one kind of thing from another and carry no judgement.
 *
 * Single-line by default, since a badge that wraps stops reading as a badge.
 * Opt into `wrap` for free text you do not control.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { color = "primary", variant = "soft", size = "1", wrap, className, style, m, mt, mb, p, pb, ...rest },
  ref,
) {
  return (
    <span
      {...rest}
      ref={ref}
      className={cx(
        styles.badge,
        styles[`color${cap(color)}`],
        variant === "solid" && styles.solid,
        styles[`size${size}`],
        wrap && styles.wrap,
        className,
      )}
      style={spacingStyle({ m, mt, mb, p, pb }, style)}
    />
  );
});
