"use client";
import type * as React from "react";
import { createContext, useContext, useId, type ReactNode } from "react";
import { cx } from "./propShared";
import styles from "./RadioGroup.module.scss";

interface GroupCtx {
  value: string;
  onValueChange: (v: string) => void;
  disabled?: boolean;
  name: string;
}
const Ctx = createContext<GroupCtx | null>(null);

export interface RadioGroupProps {
  /** The selected item's value. Fully controlled. */
  value: string;
  /** Called with the newly selected value. */
  onValueChange: (v: string) => void;
  /** Disables every item at once. */
  disabled?: boolean;
  /** Merged onto the group wrapper. */
  className?: string;
  /** One or more `RadioGroup.Item`. */
  children?: ReactNode;
}

/**
 * A single-choice control for short lists, where seeing every option at once
 * matters more than saving space. Reach for Select when it does not.
 */
function RadioGroupRoot({ value, onValueChange, disabled, className, children }: RadioGroupProps) {
  const name = useId();
  return (
    <Ctx.Provider value={{ value, onValueChange, disabled, name }}>
      <div role="radiogroup" className={cx(styles.root, className)}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

export interface RadioGroupItemProps {
  /** Reported to the group's onValueChange when chosen. */
  value: string;
  /** Disables this option only. */
  disabled?: boolean;
  /** The option's label. Part of the click target, not merely beside it. */
  children?: ReactNode;
}

/**
 * One option.
 *
 * With children it labels itself: a <label> wraps the input, the orb and the
 * children, so the text is part of the click target. Without children it
 * emits a bare span instead, so an OUTER label can own the association —
 * nesting one label inside another is invalid HTML.
 */
function Item({ value, disabled, children }: RadioGroupItemProps) {
  const g = useContext(Ctx);
  if (!g) throw new Error("RadioGroup.Item must be inside a RadioGroup");
  const isDisabled = disabled || g.disabled;
  const control = (
    <>
      <input
        type="radio"
        className={styles.input}
        name={g.name}
        value={value}
        checked={g.value === value}
        disabled={isDisabled}
        onChange={() => g.onValueChange(value)}
      />
      <span className={cx(styles.orb, "spRadioOrb")} aria-hidden="true">
        {/* The orb's own ::before and ::after are the glass and the star
            core, so the ignition ring needs an element of its own. */}
        <span className={styles.burst} />
      </span>
    </>
  );
  if (children === undefined || children === null) {
    return <span className={styles.item}>{control}</span>;
  }
  return (
    <label className={cx(styles.item, styles.selfLabeled)}>
      {control}
      {children}
    </label>
  );
}

/**
 * Exactly one choice from a set you can see all of at once.
 *
 * Use it where the options matter enough to be read side by side and there are
 * few enough to show — up to about seven. Past that a `Select` keeps the page
 * calm. Where several answers can be true at the same time, that is
 * `CheckboxGroup`.
 *
 * Hold the chosen value and pass `onValueChange`. Each orb ignites when it is
 * chosen, arrow keys move between the options the way a native radio group
 * does, and a label that wraps to two lines keeps its orb beside the first
 * line rather than drifting to the middle.
 *
 * Compose it from `RadioGroup.Item`.
 */
export const RadioGroup = Object.assign(RadioGroupRoot, { Item });
