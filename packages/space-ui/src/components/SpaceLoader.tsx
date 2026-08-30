"use client";

import { cx } from "./propShared";
import styles from "./SpaceLoader.module.scss";

export interface SpaceLoaderProps {
  /** sm = inline/compact spots. md = default. lg = full-panel takeovers. */
  size?: "sm" | "md" | "lg";
  /** Visible caption under the spinner; also doubles as the accessible name. */
  label?: string;
  className?: string;
}

/**
 * Orbital spinner: a small pulsing "planet" disc at the center of a static
 * ring, with a "moon" dot traveling the ring. Dependency-free CSS animation
 * so it composes cleanly wherever a lazy chunk or async panel needs a
 * space-themed loading state (see SurfaceView's dynamic-import loader).
 */
export function SpaceLoader({ size = "md", label, className }: SpaceLoaderProps) {
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
