"use client";
import type * as React from "react";
import { forwardRef, type ReactNode } from "react";
import { cx } from "./propShared";
import styles from "./TextField.module.scss";
import ctl from "../styles/spaceControls.module.scss";

export interface RootProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className" | "style"> {
  className?: string;
  /** Ambient motion on the rim. The glass skin is always applied.
   *  Default true. */
  animated?: boolean;
  style?: React.CSSProperties;
  children?: ReactNode; // Slot(s)
}

export const Root = forwardRef<HTMLInputElement, RootProps>(function Root(
  { className, style, animated = true, children, ...inputProps },
  ref,
) {
  return (
    <div
      className={cx(styles.root, ctl.spaceInput, "spTextFieldRoot", className)}
      data-animated={animated ? undefined : "false"}
      style={style}
    >
      {children}
      <input {...inputProps} ref={ref} className={cx(styles.input, "spTextFieldInput")} />
    </div>
  );
});

export function Slot({ children }: { children?: ReactNode }) {
  return <span className={styles.slot}>{children}</span>;
}
