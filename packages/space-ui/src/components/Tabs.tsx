// src/components/ui/Tabs.tsx
// ARIA tabs matching Radix's shape. Inactive Content unmounts (Radix's
// default). Trigger emits data-state for the glass active styling the
// ConfigurationPanel SCSS re-anchors to.
"use client";
import type * as React from "react";
import { createContext, useContext, useId, type ReactNode } from "react";
import { cx } from "./propShared";
import styles from "./Tabs.module.scss";
import ctl from "../styles/spaceControls.module.scss";

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
  if (!ctx) throw new Error("Tabs parts must be inside Tabs.Root");
  return ctx;
};

export function Root({ value, onValueChange, className, children }: {
  value: string; onValueChange: (v: string) => void; className?: string; children?: ReactNode;
}) {
  const id = useId();
  return (
    <Ctx.Provider value={{ value, onValueChange, id }}>
      <div className={className}>{children}</div>
    </Ctx.Provider>
  );
}

export function List({ children }: { children?: ReactNode }) {
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

export function Trigger({ value, className, animated = true, children, ...rest }: {
  value: string; className?: string;
  /** Ambient motion on the rim. Default true. */
  animated?: boolean;
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
      className={cx(styles.trigger, ctl.spaceControl, "spTabsTrigger", className)}
      data-animated={animated ? undefined : "false"}
      onClick={() => t.onValueChange(value)}
    >
      {children}
    </button>
  );
}

export function Content({ value, children }: { value: string; children?: ReactNode }) {
  const t = useTabs();
  if (t.value !== value) return null;
  return (
    <div role="tabpanel" id={`${t.id}-panel-${value}`} aria-labelledby={`${t.id}-tab-${value}`}>
      {children}
    </div>
  );
}
