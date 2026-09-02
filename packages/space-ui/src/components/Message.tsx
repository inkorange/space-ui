"use client";
import type * as React from "react";
import { forwardRef, type ReactNode } from "react";
import { cx } from "./propShared";
import { InfoCircledIcon, ExclamationTriangleIcon, CrossCircledIcon } from "./icons";
import styles from "./Message.module.scss";

export type MessageVariant = "info" | "warning" | "alert";

/** Each variant carries its own glyph, so the message reads at a glance
 *  before any of its words do. Overridable per instance via `icon`. */
const ICONS: Record<MessageVariant, ReactNode> = {
  info: <InfoCircledIcon />,
  warning: <ExclamationTriangleIcon />,
  alert: <CrossCircledIcon />,
};

/**
 * How loudly each variant announces itself.
 *
 * `alert` uses role="alert", which is assertive: it interrupts whatever a
 * screen reader is saying. That is right for something gone wrong and wrong
 * for everything else, so info and warning are polite status regions that
 * wait their turn.
 */
const ROLES: Record<MessageVariant, { role: string; live?: "polite" }> = {
  info: { role: "status", live: "polite" },
  warning: { role: "status", live: "polite" },
  alert: { role: "alert" },
};

export interface MessageProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Which message this is. `info` states something, `warning` flags a risk
   *  worth acting on, `alert` reports something already wrong. Default
   *  `info`. */
  variant?: MessageVariant;
  /** An optional bold line above the body. Omit for a single-line message —
   *  a title that merely restates the body is noise.
   *
   *  This shadows the HTML `title` attribute, which took a string and showed
   *  a browser tooltip. A tooltip on a banner nobody hovers was never the
   *  useful reading of the name. */
  title?: ReactNode;
  /** Replaces the variant's own glyph. Pass `null` for no icon at all. */
  icon?: ReactNode;
  /** The message. */
  children?: ReactNode;
}

/**
 * A banner that tells the reader something about the state of the page — a
 * risk, a result, a failure.
 *
 * The three variants do not merely change hue. `info` is lit like the rest of
 * the system, cool and calm; `warning` warms the rim to amber; `alert` uses
 * the ember treatment, the same warm limb the destructive Button wears. Each
 * carries its own glyph so the kind of message reads before the words do.
 *
 * For a decision the reader must make, reach for `AlertDialog` instead — a
 * message states, it does not ask.
 */
export const Message = forwardRef<HTMLDivElement, MessageProps>(function Message(
  { variant = "info", title, icon, className, children, ...rest },
  ref,
) {
  const glyph = icon === undefined ? ICONS[variant] : icon;
  const { role, live } = ROLES[variant];

  return (
    <div
      {...rest}
      ref={ref}
      role={role}
      aria-live={live}
      className={cx(styles.message, styles[variant], className)}
    >
      {glyph != null && (
        <span className={styles.icon} aria-hidden="true">
          {glyph}
        </span>
      )}
      <div className={styles.body}>
        {title != null && <p className={styles.title}>{title}</p>}
        {children != null && <div className={styles.text}>{children}</div>}
      </div>
    </div>
  );
});
