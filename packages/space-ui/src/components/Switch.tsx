import type { ReactNode } from "react";

import { cx } from "./propShared";
import styles from "./Switch.module.scss";

export interface SwitchProps {
  /** Whether it is on. Fully controlled. */
  checked: boolean;
  /** Called with the new state. */
  onCheckedChange: (checked: boolean) => void;
  /** Disables it. */
  disabled?: boolean;
  /** Names it for assistive tech when there are no children to do so. */
  "aria-label"?: string;
  /** Merged onto the label. */
  className?: string;
  /** The label. Part of the click target, not merely beside it. */
  children?: ReactNode;
}

/**
 * A setting that takes effect the moment it is flipped.
 *
 * Use it for state the application acts on at once — a notification turned
 * off, a layer shown, a mode entered. Use `Checkbox` instead for a choice
 * that is collected and submitted with the rest of a form: the two look
 * alike but answer different questions, and a switch inside a form that has
 * not saved yet tells the reader a lie about what has happened.
 *
 * It is a checkbox underneath, with `role="switch"` over it. That keeps the
 * things a native control already does well — focus, Space to toggle, form
 * participation, the disabled state — while announcing as on or off rather
 * than as ticked.
 */
export function Switch({
  checked,
  onCheckedChange,
  disabled,
  className,
  "aria-label": ariaLabel,
  children,
}: SwitchProps) {
  const control = (
    <>
      <input
        type="checkbox"
        role="switch"
        className={styles.input}
        aria-label={ariaLabel}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange(e.currentTarget.checked)}
      />
      {/* The paint. aria-hidden because the input above is the control: a
          screen reader should hear one switch, not a switch and a decoration. */}
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb}>
          {/* The ring lives inside the moon so it travels with it, and so the
              moon's own gradient is not disturbed by a second background. */}
          <span className={styles.burst} />
        </span>
      </span>
    </>
  );

  if (children === undefined || children === null) {
    return <span className={cx(styles.item, className)}>{control}</span>;
  }

  return (
    <label className={cx(styles.item, styles.selfLabeled, className)}>
      {control}
      <span className={styles.label}>{children}</span>
    </label>
  );
}
