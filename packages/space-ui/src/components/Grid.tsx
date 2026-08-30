import type * as React from "react";
import { forwardRef, type ReactNode } from "react";
import { cx, spacingStyle, type SpacingProps } from "./propShared";
import styles from "./Grid.module.scss";

type Cols = "1" | "2" | "3";
export interface GridProps extends SpacingProps, React.HTMLAttributes<HTMLDivElement> {
  columns?: Cols | { initial?: Cols; sm?: Cols; md?: Cols };
  gap?: "1" | "2" | "3" | "4" | "5" | "6";
  children?: ReactNode;
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid(
  { columns, gap, className, style, m, mt, mb, p, pb, ...rest },
  ref,
) {
  const colCls =
    typeof columns === "string"
      ? [styles[`cols${columns}`]]
      : columns
      ? [
          columns.initial && styles[`cols${columns.initial}`],
          columns.sm && styles[`smCols${columns.sm}`],
          columns.md && styles[`mdCols${columns.md}`],
        ]
      : [];
  return (
    <div
      {...rest}
      ref={ref}
      className={cx(styles.grid, ...(colCls as string[]), gap && styles[`gap${gap}`], className)}
      style={spacingStyle({ m, mt, mb, p, pb }, style)}
    />
  );
});
