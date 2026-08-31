import type * as React from "react";
import { cloneElement, forwardRef, isValidElement, type ReactNode } from "react";
import { cx, spacingStyle, type SpacingProps } from "./propShared";
import styles from "./Link.module.scss";

export interface LinkProps
  extends SpacingProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "color"> {
  /** Render the single child element instead of an `<a>`, merging link
   *  styling onto it. For wrapping a router's own Link component without
   *  nesting two anchors. */
  asChild?: boolean;
  /** Font size step: 1=12px, 2=14px, 3=16px. Matches Text's first three
   *  steps so inline links sit flush with surrounding copy. */
  size?: "1" | "2" | "3";
  children?: ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { asChild, size, className, style, m, mt, mb, p, pb, children, ...rest },
  ref,
) {
  const cls = cx(styles.link, size && styles[`size${size}`], className);
  const merged = spacingStyle({ m, mt, mb, p, pb }, style);
  if (asChild && isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string; style?: React.CSSProperties }>;
    return cloneElement(child, {
      ...rest,
      className: cx(cls, child.props.className),
      style: { ...merged, ...child.props.style },
    });
  }
  return (
    <a {...rest} ref={ref} className={cls} style={merged}>
      {children}
    </a>
  );
});
