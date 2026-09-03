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
  onValueChange,
  orientation = "horizontal",
  className = "",
}: {
  /** The segments, in display order. Every option is always visible —
   *  this is a segmented control, not a menu.
   */
  options: IconToggleOption<V>[];
  /** The selected option's value. Fully controlled.
   *
   *  NoInfer so V is derived from `options` alone. Without it a value that is
   *  not among the options simply widened V to include itself, which made the
   *  generic silently accept the one mistake it looks like it should catch. */
  value: NoInfer<V>;
  /** Called with the newly selected value. Not called when the already
   *  selected option is clicked. */
  onValueChange(next: V): void;
  /** Which way the pill runs. `vertical` for a rail down the edge of a
   *  viewport, where a horizontal strip would eat the width. Default
   *  `horizontal`. */
  orientation?: "horizontal" | "vertical";
  /** Merged onto the group wrapper. */
  className?: string;
}) {
  const vertical = orientation === "vertical";
  return (
    <div
      className={`${styles.group} ${vertical ? styles.vertical : ""} ${className}`}
      role="group"
    >
      {options.map((opt) => (
        // A horizontal pill sits at the top of the scene, so its tooltips hang
        // below it. A vertical one has a segment directly below every segment,
        // so they go to the side instead — otherwise each tooltip covers the
        // next option along.
        <Tooltip key={opt.value} label={opt.label} side={vertical ? "right" : "bottom"}>
          <button
            type="button"
            className={`${styles.segment} ${opt.value === value ? styles.active : ""}`}
            aria-label={opt.label}
            aria-pressed={opt.value === value}
            onClick={() => {
              if (opt.value !== value) onValueChange(opt.value);
            }}
          >
            {opt.icon}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
