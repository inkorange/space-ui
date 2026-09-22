"use client";
import type * as React from "react";
import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { cx } from "./propShared";
import { CheckIcon } from "./icons";
import styles from "./Checkbox.module.scss";

interface GroupCtx {
  value: string[];
  onValueChange: (v: string[]) => void;
  disabled?: boolean;
}
const Ctx = createContext<GroupCtx | null>(null);

/** The tile, its marks, and the input that actually holds the state. */
function Control({
  checked,
  indeterminate,
  disabled,
  onToggle,
  value,
  ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onToggle: (next: boolean) => void;
  value?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLInputElement | null>(null);

  // Indeterminate exists only as a DOM property — there is no attribute for
  // it — and setting it is what makes the input announce as "mixed".
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate === true;
  }, [indeterminate]);

  return (
    <>
      <input
        ref={ref}
        type="checkbox"
        className={styles.input}
        aria-label={ariaLabel}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onToggle(e.currentTarget.checked)}
      />
      <span className={styles.box} aria-hidden="true">
        <CheckIcon className={cx(styles.mark, styles.tick)} />
        <span className={cx(styles.mark, styles.dash)} />
      </span>
    </>
  );
}

export interface CheckboxGroupProps {
  /** The chosen values. Fully controlled; order is the caller's to keep. */
  value: string[];
  /** Called with the new list whenever an item is ticked or unticked. */
  onValueChange: (value: string[]) => void;
  /** Disables every item at once. */
  disabled?: boolean;
  /** Names the set for assistive tech — "Planet types", say. Use it whenever
   *  the visible heading above the group is not already tied to it. */
  "aria-label"?: string;
  /** Merged onto the group wrapper. */
  className?: string;
  /** One or more `CheckboxGroup.Item`. */
  children?: ReactNode;
}

/**
 * A set of options where any number can be chosen, including none.
 *
 * The group holds the chosen values as an array and reports a new array on
 * every change, so a caller stores one piece of state rather than one boolean
 * per option. For a single yes/no — accepting terms, toggling one setting —
 * use `Checkbox` on its own; for choosing exactly one of several, RadioGroup.
 */
function CheckboxGroupRoot({
  value,
  onValueChange,
  disabled,
  className,
  "aria-label": ariaLabel,
  children,
}: CheckboxGroupProps) {
  return (
    <Ctx.Provider value={{ value, onValueChange, disabled }}>
      {/* group, not radiogroup: these options are independent of each other. */}
      <div role="group" aria-label={ariaLabel} className={cx(styles.root, className)}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

export interface CheckboxGroupItemProps {
  /** Added to, or removed from, the group's value when ticked. */
  value: string;
  /** Disables this option only. */
  disabled?: boolean;
  /** The option's label. Part of the click target, not merely beside it. */
  children?: ReactNode;
}

/**
 * One option in a group.
 *
 * With children it labels itself: a <label> wraps the input, the tile and the
 * children, so the text is part of the click target. Without children it
 * emits a bare span instead, so an OUTER label can own the association —
 * nesting one label inside another is invalid HTML.
 */
function Item({ value, disabled, children }: CheckboxGroupItemProps) {
  const g = useContext(Ctx);
  if (!g) throw new Error("CheckboxGroup.Item must be inside a CheckboxGroup");
  const isDisabled = disabled || g.disabled;
  const checked = g.value.includes(value);

  const control = (
    <Control
      checked={checked}
      disabled={isDisabled}
      value={value}
      // Ticking appends, so the order of the value array is the order things
      // were chosen in; unticking keeps the rest as they were.
      onToggle={(next) =>
        g.onValueChange(next ? [...g.value, value] : g.value.filter((v) => v !== value))
      }
    />
  );

  if (children === undefined || children === null) {
    return <span className={styles.item}>{control}</span>;
  }
  return (
    <label className={cx(styles.item, styles.selfLabeled)}>
      {control}
      <span className={styles.label}>{children}</span>
    </label>
  );
}

// Item hangs off the component rather than being a separate export, so the
// whole API is reachable from the one name a consumer already imported.
export const CheckboxGroup = Object.assign(CheckboxGroupRoot, { Item });

export interface CheckboxProps {
  /** Whether it is ticked. Fully controlled. */
  checked: boolean;
  /** Called with the new state. */
  onCheckedChange: (checked: boolean) => void;
  /** Partly chosen: draws a dash instead of a tick and announces as "mixed".
   *  For a "select all" whose children are only some chosen. The box still
   *  reports `checked` when clicked, so decide there what a click means. */
  indeterminate?: boolean;
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
 * A single yes/no choice: accepting terms, turning one setting on.
 *
 * For a set of options where several can be chosen, wrap `CheckboxGroup`
 * around `CheckboxGroup.Item`s and hold one array instead of a boolean each.
 */
export function Checkbox({
  checked,
  onCheckedChange,
  indeterminate,
  disabled,
  className,
  "aria-label": ariaLabel,
  children,
}: CheckboxProps) {
  const control = (
    <Control
      checked={checked}
      indeterminate={indeterminate}
      disabled={disabled}
      ariaLabel={ariaLabel}
      onToggle={onCheckedChange}
    />
  );

  if (children === undefined || children === null) {
    return (
      <span className={cx(styles.item, className)}>{control}</span>
    );
  }
  return (
    <label className={cx(styles.item, styles.selfLabeled, className)}>
      {control}
      <span className={styles.label}>{children}</span>
    </label>
  );
}
