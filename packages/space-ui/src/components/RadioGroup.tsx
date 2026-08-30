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

export interface RootProps {
  value: string;
  onValueChange: (v: string) => void;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

export function Root({ value, onValueChange, disabled, className, children }: RootProps) {
  const name = useId();
  return (
    <Ctx.Provider value={{ value, onValueChange, disabled, name }}>
      <div role="radiogroup" className={cx(styles.root, className)}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

export interface ItemProps {
  value: string;
  disabled?: boolean;
  children?: ReactNode;
}

/** With children: self-labeling (<label> wraps input+orb+children) — the
 *  SaveShareDialog pattern. Without children: emits a bare span so an
 *  OUTER label (ConfigurationPanel's <Text as="label">) owns association —
 *  nesting labels would be invalid HTML. */
export function Item({ value, disabled, children }: ItemProps) {
  const g = useContext(Ctx);
  if (!g) throw new Error("RadioGroup.Item must be inside RadioGroup.Root");
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
      <span className={cx(styles.orb, "spRadioOrb")} aria-hidden="true" />
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
