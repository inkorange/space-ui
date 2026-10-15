"use client";

import { cx } from "./propShared";
import styles from "./Loader.module.scss";

export interface LoaderProps {
  /** sm = inline/compact spots. md = default. lg = full-panel takeovers. */
  size?: "sm" | "md" | "lg";
  /** Visible caption under the spinner; also doubles as the accessible name. */
  label?: string;
  /** Merged onto the wrapper. */
  className?: string;
}

/**
 * An orbital spinner, for work whose length you cannot measure: a small
 * pulsing planet at the centre of a static ring, with a moon travelling it.
 * Where you CAN measure the work, use `Progress` instead — a spinner that
 * could have been a bar tells the reader less than it knows.
 *
 * The motion is pure CSS and runs on the compositor, so it keeps turning
 * smoothly while the main thread is busy doing the thing it is waiting on —
 * which is exactly when a loader is on screen.
 */
export function Loader({ size = "md", label, className }: LoaderProps) {
  return (
    <div
      className={cx(styles.wrap, styles[size], className)}
      role="status"
      aria-live="polite"
      aria-label={label ?? "Loading"}
    >
      <span className={styles.orbit}>
        <span className={styles.planet} />
        <span className={styles.moon} />
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
