"use client";

import type { ReactNode } from "react";
import { Tooltip } from "./Tooltip";
import styles from "./IconToggle.module.scss";

export interface IconToggleOption<V extends string> {
  value: V;
  icon: ReactNode;
  /** Used for aria-label and the hover tooltip. */
  label: string;
}

/**
 * A segmented icon toggle: every option is always visible in one pill, the
 * selected one reads as active, clicking any option selects it. Built for the
 * scene view switcher (planet / orrery / surface), where the old pattern —
 * showing only the views you are NOT on and swapping icons on click — made
 * the control's meaning flip under the cursor (owner: both icons should be
 * "always visible, the selected one is the active one"). Generic over the
 * option set so other icon-mode switchers can reuse it.
 */
export function IconToggle<V extends string>({
  options,
  value,
  onChange,
  className = "",
}: {
  options: IconToggleOption<V>[];
  value: V;
  onChange(next: V): void;
  className?: string;
}) {
  return (
    <div className={`${styles.group} ${className}`} role="group">
      {options.map((opt) => (
        // The pill sits at the top of the scene, so its tooltips hang below.
        <Tooltip key={opt.value} label={opt.label} side="bottom">
          <button
            type="button"
            className={`${styles.segment} ${opt.value === value ? styles.active : ""}`}
            aria-label={opt.label}
            aria-pressed={opt.value === value}
            onClick={() => {
              if (opt.value !== value) onChange(opt.value);
            }}
          >
            {opt.icon}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
