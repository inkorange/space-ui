import type * as React from "react";
import { cloneElement, forwardRef, isValidElement, type ReactNode } from "react";
import { cx, spacingStyle, type SpacingProps } from "./propShared";
import styles from "./Flex.module.scss";

export interface FlexProps extends SpacingProps, React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  gap?: "1" | "2" | "3" | "4" | "5" | "6";
  direction?: "row" | "column";
  align?: "start" | "center" | "end" | "baseline" | "stretch";
  justify?: "start" | "center" | "end" | "between";
  wrap?: "wrap" | "nowrap";
  children?: ReactNode;
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export const Flex = forwardRef<HTMLDivElement, FlexProps>(function Flex(
  { asChild, gap, direction, align, justify, wrap, className, style, m, mt, mb, p, pb, children, ...rest },
  ref,
) {
  const cls = cx(
    styles.flex,
    gap && styles[`gap${gap}`],
    direction && styles[`direction${cap(direction)}`],
    align && styles[`align${cap(align)}`],
    justify && styles[`justify${cap(justify)}`],
    wrap && styles[`wrap${cap(wrap)}`],
    className,
  );
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
    <div {...rest} ref={ref} className={cls} style={merged}>
      {children}
    </div>
  );
});
