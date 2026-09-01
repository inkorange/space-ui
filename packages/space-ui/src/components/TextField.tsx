"use client";
import type * as React from "react";
import { forwardRef, type ReactNode } from "react";
import { cx } from "./propShared";
import styles from "./TextField.module.scss";
import ctl from "../styles/spaceControls";

export interface RootProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className" | "style"> {
  /** Merged onto the field wrapper, not the inner input. */
  className?: string;
  /** Ambient motion on the rim. The glass skin is always applied.
   *  Default true. */
  animated?: boolean;
  /** Applied to the field wrapper — set width here. */
  style?: React.CSSProperties;
  /** Slots rendered inside the field, alongside the input. */
  children?: ReactNode; // Slot(s)
}

/**
 * Single-line text entry. Composed as a Root so slots can sit alongside the
 * input inside the same field surface.
 *
 * Props land on the inner input, so `value`, `onChange` and the rest behave
 * as they would on a bare input.
 */
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

/**
 * A fixed element inside the field, before or after the input — an icon, a
 * unit, a short affordance. Sits within the field's surface rather than
 * beside it, and does not shrink as the input fills.
 */
export function Slot({
  children,
}: {
  /** The slot's contents — an icon, a unit, a short affordance. */
  children?: ReactNode;
}) {
  return <span className={styles.slot}>{children}</span>;
}
