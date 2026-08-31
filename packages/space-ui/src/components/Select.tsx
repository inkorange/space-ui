// src/components/ui/Select.tsx
// Compound Select matching the Radix JSX shape used by all 16 app sites
// (Root/Trigger/Content/Item; single-select; 100% controlled). Native
// engine: <button> trigger + an always-mounted hidden listbox, absolutely
// positioned under the trigger (every styled site used position="popper";
// no site is inside a ScrollArea, so no portal is needed — and skipping the
// portal keeps in-dialog Selects inside the dialog's stacking context).
"use client";
import type * as React from "react";
import {
  Children, createContext, isValidElement, useCallback, useContext,
  useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode,
} from "react";
import { cx } from "./propShared";
import styles from "./Select.module.scss";
import ctl from "../styles/spaceControls.module.scss";

interface RootCtx {
  value: string;
  onValueChange: (v: string) => void;
  disabled?: boolean;
  open: boolean;
  setOpen: (o: boolean) => void;
  highlighted: string | null;
  setHighlighted: (v: string | null) => void;
  listboxId: string;
  values: string[];
  /** Every item's label, disabled included — used to size the trigger. */
  itemLabels: ReactNode[];
  labelFor: (v: string) => ReactNode;
}
const Ctx = createContext<RootCtx | null>(null);
const useSelect = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Select parts must be inside Select.Root");
  return ctx;
};

// Shared id contract between the listbox's aria-activedescendant and each
// Item's id. encodeURIComponent guards against values containing spaces or
// other characters that aren't legal in an HTML id (every current call site
// uses plain slugs/numbers, but this keeps the contract safe for any future
// value).
const optionId = (listboxId: string, value: string) => `${listboxId}-${encodeURIComponent(value)}`;

// The trigger ref travels through its own context, kept separate from
// RootCtx above: a single context object mixing a ref field with plain
// state fields makes every read of that object's OTHER fields look like a
// render-time ref access to the react-hooks/refs lint rule, anywhere in the
// component (not just the JSX using the ref) — this side-steps that.
const RefCtx = createContext<React.RefObject<HTMLButtonElement | null> | null>(null);
const useTriggerRef = () => {
  const ref = useContext(RefCtx);
  if (!ref) throw new Error("Select parts must be inside Select.Root");
  return ref;
};

/** Pure render-time walk of <Content>'s children collecting Item values and
 *  labels — no effects, so the trigger label is correct on first paint,
 *  under SSR, and in renderToStaticMarkup tests. */
function collectItems(children: ReactNode): Array<{ value: string; label: ReactNode; disabled?: boolean }> {
  const out: Array<{ value: string; label: ReactNode; disabled?: boolean }> = [];
  const walk = (nodes: ReactNode) => {
    Children.forEach(nodes, (child) => {
      if (!isValidElement(child)) return;
      const props = child.props as { value?: string; children?: ReactNode; disabled?: boolean };
      if (child.type === Item && typeof props.value === "string") {
        out.push({ value: props.value, label: props.children, disabled: props.disabled });
      } else if (props.children) {
        walk(props.children);
      }
    });
  };
  walk(children);
  return out;
}

export interface RootProps {
  value: string;
  onValueChange: (v: string) => void;
  disabled?: boolean;
  children?: ReactNode;
}

export function Root({ value, onValueChange, disabled, children }: RootProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Find the <Content> child and index its items at render time.
  const contentChildren = useMemo(() => {
    let found: ReactNode = null;
    Children.forEach(children, (child) => {
      if (isValidElement(child) && child.type === Content) {
        found = (child.props as { children?: ReactNode }).children;
      }
    });
    return found;
  }, [children]);
  const items = useMemo(() => collectItems(contentChildren), [contentChildren]);
  const values = useMemo(() => items.filter((i) => !i.disabled).map((i) => i.value), [items]);
  const itemLabels = useMemo(() => items.map((i) => i.label), [items]);
  const labelFor = useCallback(
    (v: string) => items.find((i) => i.value === v)?.label ?? null,
    [items],
  );

  // Light-dismiss: click outside closes.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <Ctx.Provider
      value={{ value, onValueChange, disabled, open, setOpen, highlighted, setHighlighted, listboxId, values, itemLabels, labelFor }}
    >
      <RefCtx.Provider value={triggerRef}>
        <div ref={rootRef} className={styles.root}>
          {children}
        </div>
      </RefCtx.Provider>
    </Ctx.Provider>
  );
}

export interface TriggerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  placeholder?: string;
  /** Ambient motion: the lit arc orbiting the rim. The glass skin itself
   *  is always applied. Default true. */
  animated?: boolean;
}

export function Trigger({ placeholder, animated = true, className, ...rest }: TriggerProps) {
  const s = useSelect();
  const triggerRef = useTriggerRef();
  const label = s.value ? s.labelFor(s.value) : null;
  const openWith = (highlight: string | null) => {
    s.setHighlighted(highlight ?? s.values[0] ?? null);
    s.setOpen(true);
  };
  return (
    <button
      type="button"
      {...rest}
      ref={triggerRef}
      disabled={s.disabled}
      className={cx(styles.trigger, ctl.spaceControl, "spSelectTrigger", className)}
      data-animated={animated ? undefined : "false"}
      data-state={s.open ? "open" : "closed"}
      aria-haspopup="listbox"
      aria-expanded={s.open}
      aria-controls={s.listboxId}
      onClick={() => (s.open ? s.setOpen(false) : openWith(s.value || null))}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openWith(s.value || null);
        }
      }}
    >
      {/* The visible label and a hidden copy of every option share one grid
          cell, so the button is as wide as its widest choice and never jumps
          width when the selection changes. Capped by
          --sp-select-trigger-max-width, past which the label ellipsizes. */}
      <span className={styles.labelWrap}>
        <span className={styles.sizer} data-sizer="" aria-hidden="true">
          {s.itemLabels.map((l, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={i}>{l}</span>
          ))}
          {placeholder && <span>{placeholder}</span>}
        </span>
        <span className={styles.triggerLabel}>{label ?? placeholder ?? ""}</span>
      </span>
      <svg className={styles.chevron} width="9" height="9" viewBox="0 0 9 9" aria-hidden="true">
        <path d="M0.5 3 L4.5 7 L8.5 3" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </button>
  );
}

export interface ContentProps {
  className?: string;
  /** Accepted for Radix call-site compatibility ("popper" everywhere);
   *  our listbox is always trigger-anchored. */
  position?: string;
  /** Ambient motion on the panel rim. Default true. */
  animated?: boolean;
  children?: ReactNode;
}

export function Content({ className, position: _position, animated = true, children }: ContentProps) {
  const s = useSelect();
  const triggerRef = useTriggerRef();
  const listRef = useRef<HTMLDivElement | null>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);
  const [maxHeight, setMaxHeight] = useState<number | null>(null);

  // Measures the trigger's rendered width (and available vertical space
  // below it) to size the listbox. useLayoutEffect so the measurement is
  // applied before the browser paints the first open frame — a plain
  // useEffect flashes one frame with --_select-trigger-width unset.
  useLayoutEffect(() => {
    if (s.open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setTriggerWidth(triggerRef.current.offsetWidth);
      // Clamp to the space between the trigger and the viewport bottom.
      // This is a partial mitigation, not a full fix: it keeps the listbox
      // from forcing extra scroll inside its own scrollable ancestor (e.g.
      // AuthModal's ~87-entry birth-year select), but a listbox inside a
      // dialog that's ALSO been scrolled can still have its trigger (and
      // thus this measurement) clipped by the dialog's own overflow before
      // this ever runs. Known QA follow-up on the birth-year select.
      const available = window.innerHeight - rect.bottom - 16;
      setMaxHeight(Math.min(380, Math.max(120, available)));
    }
  }, [s.open, triggerRef]);

  // Focus the listbox on open so arrow keys work immediately; return focus
  // to the trigger on close (checked against the in-dialog sites: Escape
  // must close the Select WITHOUT closing the surrounding Radix Dialog).
  useEffect(() => {
    if (s.open) listRef.current?.focus();
  }, [s.open]);

  const move = (delta: number) => {
    const idx = s.highlighted ? s.values.indexOf(s.highlighted) : -1;
    const next = Math.min(Math.max(idx + delta, 0), s.values.length - 1);
    s.setHighlighted(s.values[next] ?? null);
  };

  return (
    <div
      ref={listRef}
      id={s.listboxId}
      role="listbox"
      tabIndex={-1}
      hidden={!s.open}
      aria-activedescendant={s.highlighted ? optionId(s.listboxId, s.highlighted) : undefined}
      className={cx(styles.listbox, ctl.spacePanel, className)}
      data-animated={animated ? undefined : "false"}
      style={
        triggerWidth != null || maxHeight != null
          ? ({
              ...(triggerWidth != null ? { "--_select-trigger-width": `${triggerWidth}px` } : {}),
              ...(maxHeight != null ? { maxHeight: `${maxHeight}px` } : {}),
            } as React.CSSProperties)
          : undefined
      }
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation(); // don't let an ancestor Dialog close too
          s.setOpen(false);
          triggerRef.current?.focus();
        } else if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
        else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
        else if (e.key === "Home") { e.preventDefault(); s.setHighlighted(s.values[0] ?? null); }
        else if (e.key === "End") { e.preventDefault(); s.setHighlighted(s.values[s.values.length - 1] ?? null); }
        else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (s.highlighted) {
            s.onValueChange(s.highlighted);
            s.setOpen(false);
            triggerRef.current?.focus();
          }
        } else if (e.key === "Tab") {
          s.setOpen(false);
        }
      }}
    >
      {children}
    </div>
  );
}

export interface ItemProps {
  value: string;
  disabled?: boolean;
  children?: ReactNode;
}

export function Item({ value, disabled, children }: ItemProps) {
  const s = useSelect();
  const triggerRef = useTriggerRef();
  const selected = s.value === value;
  const highlighted = s.highlighted === value;
  return (
    <div
      id={optionId(s.listboxId, value)}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      data-highlighted={highlighted ? "" : undefined}
      className={cx(styles.item, "spSelectItem")}
      onMouseEnter={() => !disabled && s.setHighlighted(value)}
      onClick={() => {
        if (disabled) return;
        s.onValueChange(value);
        s.setOpen(false);
        triggerRef.current?.focus();
      }}
    >
      {children}
    </div>
  );
}
