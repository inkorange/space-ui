"use client";
import type * as React from "react";
import { forwardRef } from "react";
import { cx } from "./propShared";
import styles from "./TextArea.module.scss";
import ctl from "../styles/spaceControls.module.scss";

export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "style"> {
  className?: string;
  /** Ambient motion on the rim. The glass skin is always applied.
   *  Default true. */
  animated?: boolean;
  style?: React.CSSProperties;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { className, style, animated = true, ...rest },
  ref,
) {
  return (
    <div
      className={cx(styles.root, ctl.spaceInput, ctl.spaceTextArea, "spTextFieldRoot", className)}
      data-animated={animated ? undefined : "false"}
      style={style}
    >
      <textarea {...rest} ref={ref} className={cx(styles.textarea, "spTextAreaInput")} />
    </div>
  );
});
