import type * as React from "react";
import { forwardRef } from "react";
import { cx } from "./propShared";
import styles from "./Separator.module.scss";

export interface SeparatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "1" | "2" | "3" | "4";
}

export const Separator = forwardRef<HTMLSpanElement, SeparatorProps>(function Separator(
  { size = "4", className, ...rest },
  ref,
) {
  return (
    <span
      {...rest}
      ref={ref}
      role="separator"
      className={cx(styles.separator, size === "4" && styles.full, className)}
    />
  );
});
