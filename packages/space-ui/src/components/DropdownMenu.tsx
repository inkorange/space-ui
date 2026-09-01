// src/components/ui/DropdownMenu.tsx
// role="menu" on a popover="auto" div: top-layer + click-outside dismissal
// come from the platform. Anchor positioning is manual (align="end" is the
// only inventoried mode). Roving tabindex arrows per the spec.
"use client";
import type * as React from "react";
import {
  createContext, createElement, isValidElement, useContext,
  useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode,
} from "react";
import { cx } from "./propShared";
import styles from "./DropdownMenu.module.scss";
import { Button, type ButtonProps } from "./Button";

interface MenuCtx {
  open: boolean;
  setOpen: (o: boolean) => void;
  menuId: string;
}
const Ctx = createContext<MenuCtx | null>(null);
const useMenu = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("DropdownMenu parts must be inside a DropdownMenu");
  return ctx;
};



// Whether the popover's current "closed" toggle was initiated by an Item
// activating rather than a platform light-dismiss (click outside / Esc).
// Item arms this just before it calls setOpen(false); the root's onToggle
// reads-and-clears it to decide whether to arm the light-dismiss race guard.
// It stays in its own context because a mutable ref must not sit on a value
// object that is also read during render — a ref write would not trigger the
// re-render that consumers of Ctx expect.
const ItemClosedRefCtx = createContext<React.RefObject<boolean> | null>(null);
const useItemClosedRef = () => {
  const ref = useContext(ItemClosedRefCtx);
  if (!ref) throw new Error("DropdownMenu parts must be inside a DropdownMenu");
  return ref;
};

// Plain helper that reads-and-clears the flag, kept out of the click handler
// so the `.current` access is not mistaken for a ref read during render.
function consumeLightDismissFlag(ref: React.RefObject<boolean>): boolean {
  if (!ref.current) return false;
  ref.current = false;
  return true;
}

// Same reasoning: Item's asChild onClick is built inside the props object
// passed to createElement rather than as a literal JSX attribute, so a direct
// `.current` write there trips the same ref-during-render check.
function markItemInitiatedClose(ref: React.RefObject<boolean>): void {
  ref.current = true;
}

export interface DropdownMenuProps extends Omit<ButtonProps, "children"> {
  /** The trigger's content. The trigger is always a Button, so this is what
   *  goes inside it — text, or an icon with `iconOnly`. */
  label: ReactNode;
  /** Which edge of the trigger the menu lines up with. Use `end` when the
   *  trigger sits near the right edge and the menu would overflow. */
  align?: "start" | "end";
  /** `DropdownMenu.Item`, `.Separator` and `.Label`, in any order. */
  children?: ReactNode;
}

/**
 * A menu of actions hung off a button.
 *
 * The trigger is built in and is always a Button — a dropdown whose trigger
 * looked like anything else was never a shape worth supporting, and making it
 * arbitrary cost a `cloneElement` that had to graft aria wiring and a click
 * handler onto someone else's element.
 *
 * The menu rides the platform's top layer via `popover`, so click-outside
 * dismissal and stacking come from the browser rather than an approximation.
 * Arrows move between items, Escape closes and returns focus to the trigger.
 */
function DropdownMenuRoot({ label, align = "start", children, ...buttonProps }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const lightDismissedRef = useRef(false);
  const itemClosedRef = useRef(false);
  const [pos, setPos] = useState<{ top: number; left: number | "auto"; right: number | "auto" } | null>(null);

  // useLayoutEffect (not useEffect) so the position is measured and applied
  // synchronously before paint — matches Select's trigger measurement and
  // avoids a one-frame flash at the wrong coordinates.
  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    if (open) {
      // Position under the trigger before entering the top layer.
      const trigger = triggerRef.current;
      if (trigger) {
        const r = trigger.getBoundingClientRect();
        const left = align === "end" ? "auto" : r.left;
        const right = align === "end" ? window.innerWidth - r.right : "auto";
        setPos({ top: r.bottom + 6, left, right });
      }
      el.showPopover();
      // Focus the first item for keyboard users.
      el.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    } else if (el.matches(":popover-open")) {
      el.hidePopover();
    }
  }, [open, align]);

  // A resize invalidates the anchored position (measured once, at open) —
  // rather than re-measuring on every tick, close the menu, as a light
  // dismiss would.
  useEffect(() => {
    if (!open) return;
    const onResize = () => setOpen(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  return (
    <Ctx.Provider value={{ open, setOpen, menuId }}>
      <ItemClosedRefCtx.Provider value={itemClosedRef}>
        <Button
          {...buttonProps}
          ref={triggerRef}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={(e) => {
            buttonProps.onClick?.(e);
            // Race: clicking the trigger while the menu is open first fires a
            // pointerdown, which the popover API treats as an outside
            // interaction and light-dismisses the popover. The click that
            // completes right after would read the now-stale open===false and
            // immediately reopen the menu it was meant to close. Skip this
            // click's toggle if a light-dismiss just landed in the same
            // gesture.
            if (consumeLightDismissFlag(lightDismissedRef)) return;
            setOpen(!open);
          }}
        >
          {label}
        </Button>

        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          popover="auto"
          className={styles.menu}
          style={
            pos
              ? {
                  top: pos.top,
                  left: pos.left === "auto" ? "auto" : pos.left,
                  right: pos.right === "auto" ? "auto" : pos.right,
                }
              : undefined
          }
          onToggle={(e: React.SyntheticEvent<HTMLDivElement>) => {
            // Platform light-dismiss (click outside / Esc) → sync React state.
            if ((e.nativeEvent as ToggleEvent).newState === "closed") {
              // An Item activating also drives this closed (setOpen(false) →
              // hidePopover() → this same toggle event) — that is not a light
              // dismiss and must not arm the race guard below. Read-and-clear
              // the item's flag to tell the two apart.
              const itemInitiated = itemClosedRef.current;
              itemClosedRef.current = false;
              if (!itemInitiated) {
                // Flag the race window for the trigger's onClick and clear it
                // shortly after — it only needs to survive the current click
                // gesture, not linger.
                lightDismissedRef.current = true;
                setTimeout(() => { lightDismissedRef.current = false; }, 300);
              }
              if (open) setOpen(false);
            }
          }}
          onKeyDown={(e) => {
            const items = Array.from(
              menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
            );
            const idx = items.indexOf(document.activeElement as HTMLElement);
            if (e.key === "ArrowDown") { e.preventDefault(); items[Math.min(idx + 1, items.length - 1)]?.focus(); }
            else if (e.key === "ArrowUp") { e.preventDefault(); items[Math.max(idx - 1, 0)]?.focus(); }
            else if (e.key === "Home") { e.preventDefault(); items[0]?.focus(); }
            else if (e.key === "End") { e.preventDefault(); items[items.length - 1]?.focus(); }
            else if (e.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
          }}
        >
          {children}
        </div>
      </ItemClosedRefCtx.Provider>
    </Ctx.Provider>
  );
}

/**
 * A non-interactive heading for a group of items. Skipped by arrow-key
 * navigation, since there is nothing to activate.
 */
function Label({
  children,
}: {
  /** Heading text for the group beneath it. Not focusable. */
  children?: ReactNode;
}) {
  return <div className={styles.label}>{children}</div>;
}

export interface DropdownMenuItemProps {
  /** Render the child element instead of the default item — for a link that
   *  should stay an anchor rather than becoming a button. */
  asChild?: boolean;
  /** Marks a destructive action, so it reads differently before it is
   *  chosen rather than after. */
  color?: "danger";
  /** Runs when the item is chosen; the menu closes either way. */
  onSelect?: () => void | Promise<void>;
  /** The item's label. */
  children?: ReactNode;
}

/**
 * One menu action. `onSelect` fires and the menu closes.
 *
 * Pass `color="danger"` for a destructive action so it reads differently from
 * its neighbours before it is chosen, not after.
 */
function Item({ asChild, color, onSelect, children }: DropdownMenuItemProps) {
  const m = useMenu();
  const itemClosedRef = useItemClosedRef();
  const cls = cx(styles.item, color === "danger" && styles.danger);
  const activate = () => {
    markItemInitiatedClose(itemClosedRef);
    m.setOpen(false);
    void onSelect?.();
  };
  if (asChild && isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown>>;
    // Rebuild (rather than cloneElement) so role/tabIndex land BEFORE the
    // child's own attributes (e.g. href) in the emitted markup — cloneElement
    // always keeps pre-existing keys in their original position. Also drop
    // the child's own role/tabIndex (if any) from restProps entirely — a
    // spread landing after the forced menuitem/-1 values would otherwise
    // silently win and undo the forced semantics.
    const {
      className: childClassName, onClick: childOnClick, children: childChildren,
      role: childRole, tabIndex: childTabIndex, ...restProps
    } = child.props;
    // Discarded — pulled out of restProps only so the forced role/tabIndex
    // below can't be silently overwritten by the child's own values.
    void childRole;
    void childTabIndex;
    const originalRef = (child as unknown as { ref?: React.Ref<unknown> }).ref;
    return createElement(
      child.type as React.ElementType,
      {
        key: child.key,
        ref: originalRef,
        role: "menuitem",
        tabIndex: -1,
        ...restProps,
        className: cx(cls, childClassName as string | undefined),
        onClick: (e: React.MouseEvent) => {
          (childOnClick as ((e: React.MouseEvent) => void) | undefined)?.(e);
          markItemInitiatedClose(itemClosedRef);
          m.setOpen(false); // real navigation proceeds; menu closes
        },
      },
      childChildren as ReactNode,
    );
  }
  return (
    <button type="button" role="menuitem" tabIndex={-1} className={cls} onClick={activate}>
      {children}
    </button>
  );
}

/**
 * A rule between groups of items — for separating a destructive action from
 * routine ones, so the two are not adjacent to a moving cursor.
 */
function Separator() {
  return <div role="separator" className={styles.separator} />;
}

// The parts hang off the component rather than being separate exports, so the
// whole API is reachable from the one name a consumer already imported.
export const DropdownMenu = Object.assign(DropdownMenuRoot, { Item, Separator, Label });
