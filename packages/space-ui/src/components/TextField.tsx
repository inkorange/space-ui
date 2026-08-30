"use client";
import type * as React from "react";
import { forwardRef, type ReactNode } from "react";
import { cx } from "./propShared";
import styles from "./TextField.module.scss";

export interface RootProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className" | "style"> {
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode; // Slot(s)
}

export const Root = forwardRef<HTMLInputElement, RootProps>(function Root(
  { className, style, children, ...inputProps },
  ref,
) {
  return (
    <div className={cx(styles.root, "spTextFieldRoot", className)} style={style}>
      {children}
      <input {...inputProps} ref={ref} className={cx(styles.input, "spTextFieldInput")} />
    </div>
  );
});

export function Slot({ children }: { children?: ReactNode }) {
  return <span className={styles.slot}>{children}</span>;
}
