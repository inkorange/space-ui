"use client";

import { forwardRef, useId, useMemo } from "react";
import styles from "./SpaceButton.module.scss";
import { mulberry32, hashString } from "../internal/seededRandom";

interface SpaceButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Circular, icon-only sizing (e.g. the share glyph). */
  iconOnly?: boolean;
  /** Warm red-dwarf rim for destructive-ish actions (e.g. Clear). */
  ember?: boolean;
  /** md = default. lg = hero CTAs. sm = compact dialog actions. micro = tiny steppers (no stars/glint). */
  size?: "sm" | "md" | "lg" | "micro";
  /** Stretch to the container width (sticky footers). */
  fullWidth?: boolean;
  /** Ambient motion: the orbiting rim, the glint sweep, and the twinkling
   *  stars. Set false for dense UI or long lists where the movement
   *  distracts. The glass look itself is not optional. Default true. */
  animated?: boolean;
}


/**
 * "Limb-lit glass" button: cosmic glass capsule whose rim glows like a planet's
 * sunlit atmosphere limb, with twinkling stars inside and a periodic glint
 * sweep. Plain <button>, so it composes with Radix Dialog.Trigger (Slot).
 */
export const SpaceButton = forwardRef<HTMLButtonElement, SpaceButtonProps>(
  function SpaceButton({ iconOnly, ember, size = "md", fullWidth, animated = true, className, children, ...rest }, ref) {
    const id = useId();

    // Unique-per-instance star field: positions and timing vary button to
    // button so the sparkles don't read as a repeated stamp.
    const starStyles = useMemo(() => {
      // Deterministic PRNG seeded from useId, so each button instance gets its
      // own star arrangement while server and client render identically (no
      // hydration mismatch, unlike Math.random in render).
      const rand = mulberry32(hashString(id));
      return Array.from({ length: 3 }, () => ({
        top: `${12 + rand() * 58}%`,
        left: `${8 + rand() * 80}%`,
        animationDelay: `${(rand() * 3.2).toFixed(2)}s`,
        animationDuration: `${(2.8 + rand() * 1.8).toFixed(2)}s`,
      }));
    }, [id]);

    const classes = [
      styles.spaceButton,
      iconOnly ? styles.iconOnly : "",
      ember ? styles.ember : "",
      size !== "md" ? styles[size] : "",
      fullWidth ? styles.fullWidth : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        className={classes}
        data-animated={animated ? undefined : "false"}
        {...rest}
      >
        {size !== "micro" && (
          <span className={styles.stars} aria-hidden>
            {starStyles.map((style, i) => (
              <i key={i} className={styles.star} style={style} />
            ))}
          </span>
        )}
        <span className={styles.label}>{children}</span>
      </button>
    );
  }
);
