"use client";
import type * as React from "react";
import { forwardRef } from "react";
import { cx } from "./propShared";
import styles from "./TextArea.module.scss";

export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "style"> {
  className?: string;
  style?: React.CSSProperties;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { className, style, ...rest },
  ref,
) {
  return (
    <div className={cx(styles.root, "spTextFieldRoot", className)} style={style}>
      <textarea {...rest} ref={ref} className={cx(styles.textarea, "spTextAreaInput")} />
    </div>
  );
});
