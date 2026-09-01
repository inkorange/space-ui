// ARIA tabs. Inactive Content unmounts, matching Radix's default.
"use client";
import type * as React from "react";
import { createContext, useContext, useId, type ReactNode } from "react";
import { cx } from "./propShared";
import styles from "./Tabs.module.scss";

interface TabsCtx {
  value: string;
  onValueChange: (v: string) => void;
  /** useId()-derived base, shared by Trigger/Content so a trigger's
   *  aria-controls always matches its panel's id (and vice versa via
   *  aria-labelledby) without either side guessing the other's id. */
  id: string;
}
const Ctx = createContext<TabsCtx | null>(null);
const useTabs = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Tabs parts must be inside a Tabs");
  return ctx;
};

export interface TabsProps {
  /** The selected tab's value. Fully controlled — there is no default. */
  value: string;
  /** Called with the newly selected tab's value. */
  onValueChange: (v: string) => void;
  /** Merged onto the wrapper div, which is otherwise unstyled. */
  className?: string;
  /** A `Tabs.List` and the `Tabs.Content`s it switches between. */
  children?: ReactNode;
}

/**
 * Wraps a tab set and owns which tab is showing. Fully controlled — pass
 * `value` and `onValueChange`; there is no uncontrolled mode.
 *
 * Renders a plain div, so it imposes no layout of its own. It also mints the
 * id that pairs each Trigger with its Content, which is why every part has to
 * sit inside it rather than being usable on its own.
 */
function TabsRoot({ value, onValueChange, className, children }: TabsProps) {
  const id = useId();
  return (
    <Ctx.Provider value={{ value, onValueChange, id }}>
      <div className={className}>{children}</div>
    </Ctx.Provider>
  );
}

/**
 * The row of triggers, and the keyboard model for the set: arrow keys move
 * between tabs, Home and End jump to the ends, each moving focus and
 * selection together as the ARIA tabs pattern expects.
 *
 * Bottom-aligns its children, so an active tab that grows taller rises above
 * its neighbours instead of pushing the row down — the folder-tab effect.
 */
function List({
  children,
}: {
  /** The Triggers. Their order is the tab order. */
  children?: ReactNode;
}) {
  return (
    <div
      role="tablist"
      className={cx(styles.list, "spTabsList")}
      onKeyDown={(e) => {
        const tabs = Array.from(
          (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role="tab"]')
        );
        const idx = tabs.indexOf(document.activeElement as HTMLElement);
        if (idx === -1) return;
        if (e.key === "ArrowRight") { e.preventDefault(); const t = tabs[(idx + 1) % tabs.length]; t.focus(); t.click(); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); const t = tabs[(idx - 1 + tabs.length) % tabs.length]; t.focus(); t.click(); }
        else if (e.key === "Home") { e.preventDefault(); const t = tabs[0]; t.focus(); t.click(); }
        else if (e.key === "End") { e.preventDefault(); const t = tabs[tabs.length - 1]; t.focus(); t.click(); }
      }}
    >
      {children}
    </div>
  );
}

/**
 * One tab. Selects its `value` on click and carries the ARIA wiring that ties
 * it to the matching Content.
 *
 * Emits `data-state="active" | "inactive"`, which is the hook the active
 * styling keys off — useful if you are restyling tabs from outside.
 */
function Trigger({ value, className, children, ...rest }: {
  /** Selects this value. Must match the Content it reveals. */
  value: string;
  /** Merged with the tab's own classes rather than replacing them. */
  className?: string;
  /** The tab's label. */
  children?: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const t = useTabs();
  const active = t.value === value;
  return (
    <button
      {...rest}
      type="button"
      role="tab"
      id={`${t.id}-tab-${value}`}
      aria-selected={active}
      aria-controls={`${t.id}-panel-${value}`}
      tabIndex={active ? 0 : -1}
      data-state={active ? "active" : "inactive"}
      className={cx(styles.trigger, "spTabsTrigger", className)}
      onClick={() => t.onValueChange(value)}
    >
      {children}
    </button>
  );
}

/**
 * The panel for one tab. Renders only while its `value` is the selected one —
 * inactive panels unmount rather than hide, so their contents do not run,
 * hold state, or appear to a screen reader.
 *
 * Carries no styling: the surface a tab set seats onto is the consumer's, and
 * should match `--sp-tabs-surface-color` so the active tab connects to it.
 */
function Content({
  value,
  children,
}: {
  /** Shown while this matches the Root's value. Must match a Trigger. */
  value: string;
  /** Panel contents. Unmounted while another tab is selected. */
  children?: ReactNode;
}) {
  const t = useTabs();
  if (t.value !== value) return null;
  return (
    <div role="tabpanel" id={`${t.id}-panel-${value}`} aria-labelledby={`${t.id}-tab-${value}`}>
      {children}
    </div>
  );
}

// The parts hang off the component rather than being separate exports, so the
// whole API is reachable from the one name a consumer already imported.
export const Tabs = Object.assign(TabsRoot, { List, Trigger, Content });
