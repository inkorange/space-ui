// A single-choice menu. One component and one child type:
//
//   <Select value={v} onValueChange={setV}>
//     <Select.Item value="a">A</Select.Item>
//   </Select>
//
// It used to be Root/Trigger/Content/Item, mirroring the JSX shape of the
// library this was migrated from. Three of those four were ceremony: the
// trigger was mandatory and identical at every call site, and Content only
// ever wrapped Items. They are now built in, which is why `Select` is the
// component itself rather than a namespace.
//
// Native engine: a <button> trigger plus an always-mounted hidden listbox,
// absolutely positioned under it. No portal — that keeps a Select inside a
// dialog within the dialog's stacking context.
"use client";
import type * as React from "react";
import {
  Children, createContext, isValidElement, useCallback, useContext,
  useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode,
} from "react";
import { cx } from "./propShared";
import styles from "./Select.module.scss";
import ctl from "../styles/spaceControls";

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
  labelFor: (v: string) => ReactNode;
  /** Previously carried in its own context, because with Trigger and Content
   *  as separate components a ref sitting beside plain state made every read
   *  of the OTHER fields look like a render-time ref access to
   *  react-hooks/refs. Only Item reads it now, and only inside an event
   *  handler, so the split bought nothing. Keep it that way: read `.current`
   *  in handlers and effects, never during render. */
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}
const Ctx = createContext<RootCtx | null>(null);
const useSelect = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Select.Item must be inside a Select");
  return ctx;
};

// Shared id contract between the listbox's aria-activedescendant and each
// Item's id. encodeURIComponent guards against values containing spaces or
// other characters that aren't legal in an HTML id.
const optionId = (listboxId: string, value: string) => `${listboxId}-${encodeURIComponent(value)}`;

/** Pure render-time walk of the children collecting Item values and labels —
 *  no effects, so the trigger label is correct on first paint, under SSR, and
 *  in renderToStaticMarkup tests. Recurses, so Items may be wrapped (a
 *  fragment, a `.map`, a grouping element) rather than being direct children. */
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

export interface SelectProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value" | "children" | "onChange"> {
  /** The selected item's value. Fully controlled. */
  value: string;
  /** Called with the newly selected value. */
  onValueChange: (v: string) => void;
  /** Blocks the trigger and removes it from the tab order. */
  disabled?: boolean;
  /** Shown when nothing is selected. Counts toward the control's width, so
   *  selecting an option never resizes it. */
  placeholder?: string;
  /** Ambient motion: the lit arc orbiting the rim. The glass skin itself is
   *  always applied. Default true. */
  animated?: boolean;
  /** One or more `Select.Item`. Anything else is ignored for selection but
   *  still rendered in the panel. */
  children?: ReactNode;
}

/**
 * A single-choice menu for lists too long to show inline. Fully controlled.
 *
 * The control sizes itself to its widest option, so it never changes width as
 * you select — capped by `--sp-select-trigger-max-width`, past which the label
 * ellipsizes.
 *
 * Reads its options at render time rather than through effects, so the right
 * label shows on first paint and under SSR.
 *
 * Every prop other than the ones listed lands on the trigger button, which is
 * the focusable control — so `aria-label`, `id`, `name` and `onBlur` go where
 * you would expect.
 */
function SelectRoot({
  value,
  onValueChange,
  disabled,
  placeholder,
  animated = true,
  className,
  children,
  ...rest
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);
  const [maxHeight, setMaxHeight] = useState<number | null>(null);

  const items = useMemo(() => collectItems(children), [children]);
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

  // Measures the trigger's rendered width (and the space below it) to size the
  // listbox. useLayoutEffect so it lands before the browser paints the first
  // open frame — a plain useEffect flashes one frame with the width unset.
  useLayoutEffect(() => {
    if (!open) return;
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTriggerWidth(el.offsetWidth);
    // Clamp to the space between the trigger and the viewport bottom, so a
    // long list does not force extra scroll inside a scrollable ancestor.
    const available = window.innerHeight - rect.bottom - 16;
    setMaxHeight(Math.min(380, Math.max(120, available)));
  }, [open]);

  // Focus the listbox on open so arrow keys work immediately.
  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  const openWith = (highlight: string | null) => {
    setHighlighted(highlight ?? values[0] ?? null);
    setOpen(true);
  };

  const move = (delta: number) => {
    const idx = highlighted ? values.indexOf(highlighted) : -1;
    const next = Math.min(Math.max(idx + delta, 0), values.length - 1);
    setHighlighted(values[next] ?? null);
  };

  const label = value ? labelFor(value) : null;

  return (
    <Ctx.Provider
      value={{
        value, onValueChange, disabled, open, setOpen, highlighted,
        setHighlighted, listboxId, values, labelFor, triggerRef,
      }}
    >
      <div ref={rootRef} className={styles.root}>
        <button
          type="button"
          {...rest}
          ref={triggerRef}
          disabled={disabled}
          className={cx(styles.trigger, ctl.spaceControl, "spSelectTrigger", className)}
          data-animated={animated ? undefined : "false"}
          data-state={open ? "open" : "closed"}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          onClick={() => (open ? setOpen(false) : openWith(value || null))}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openWith(value || null);
            }
          }}
        >
          {/* The visible label and a hidden copy of every option share one
              grid cell, so the button is as wide as its widest choice and
              never jumps width when the selection changes. Capped by
              --sp-select-trigger-max-width, past which the label ellipsizes. */}
          <span className={styles.labelWrap}>
            <span className={styles.sizer} data-sizer="" aria-hidden="true">
              {itemLabels.map((l, i) => (
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

        {/* Always mounted but hidden while closed, so the trigger can read the
            item labels for sizing before the panel has ever been opened. */}
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          hidden={!open}
          aria-activedescendant={highlighted ? optionId(listboxId, highlighted) : undefined}
          className={cx(styles.listbox, ctl.spacePanel)}
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
              setOpen(false);
              triggerRef.current?.focus();
            } else if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
            else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
            else if (e.key === "Home") { e.preventDefault(); setHighlighted(values[0] ?? null); }
            else if (e.key === "End") { e.preventDefault(); setHighlighted(values[values.length - 1] ?? null); }
            else if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (highlighted) {
                onValueChange(highlighted);
                setOpen(false);
                triggerRef.current?.focus();
              }
            } else if (e.key === "Tab") {
              setOpen(false);
            }
          }}
        >
          {children}
        </div>
      </div>
    </Ctx.Provider>
  );
}

export interface SelectItemProps {
  /** Reported to onValueChange when chosen. */
  value: string;
  /** Skipped by keyboard navigation and not selectable. Still contributes its
   *  width to the control's sizing. */
  disabled?: boolean;
  /** Shown in the panel and, once selected, in the closed control — so it has
   *  to read correctly in both places. */
  children?: ReactNode;
}

/**
 * One option. Its children are what the closed control displays once
 * selected, so anything rendered here has to read correctly in both places.
 */
function Item({ value, disabled, children }: SelectItemProps) {
  const s = useSelect();
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
        s.triggerRef.current?.focus();
      }}
    >
      {children}
    </div>
  );
}

// Item hangs off the component rather than being a separate export, so the
// whole API is reachable from the one name a consumer already imported.
export const Select = Object.assign(SelectRoot, { Item });
