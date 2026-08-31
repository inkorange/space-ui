import type * as React from "react";
import { forwardRef } from "react";
import { cx } from "./propShared";
import styles from "./Separator.module.scss";

export interface SeparatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Length of the rule, 1 (shortest) to 4 (full width of its container). */
  size?: "1" | "2" | "3" | "4";
}

/**
 * A hairline rule for dividing content within a surface, where a full panel
 * boundary would be too heavy. Exposed as `role="separator"`, so assistive
 * technology hears the division too.
 */
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
