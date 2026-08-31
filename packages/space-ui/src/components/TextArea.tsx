"use client";
import type * as React from "react";
import { forwardRef } from "react";
import { cx } from "./propShared";
import styles from "./TextArea.module.scss";
import ctl from "../styles/spaceControls.module.scss";

export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "style"> {
  /** Merged onto the field wrapper, not the inner textarea. */
  className?: string;
  /** Ambient motion on the rim. The glass skin is always applied.
   *  Default true. */
  animated?: boolean;
  /** Applied to the field wrapper — set width here. */
  style?: React.CSSProperties;
}

/**
 * Multi-line text entry. `rows` sets the initial height; it grows with its
 * container's width and resizes vertically only, since horizontal drag would
 * break the surrounding layout.
 */
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
