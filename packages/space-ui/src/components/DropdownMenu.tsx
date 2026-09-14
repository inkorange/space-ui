// src/components/ui/DropdownMenu.tsx
// role="menu" on a popover="auto" div: top-layer + click-outside dismissal
// come from the platform. Anchor positioning is manual (align="end" is the
// only inventoried mode). Roving tabindex arrows per the spec.
"use client";
import type * as React from "react";
import {
  createContext, createElement, isValidElement, useCallback, useContext,
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
  const [open, setOpenState] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  // What a pointer press on the trigger meant, decided at pointerdown — before
  // the platform has had a chance to light-dismiss. See the trigger below.
  const pressIntent = useRef<boolean | null>(null);
  // The latest open state, including one requested this tick but not yet
  // rendered. The trigger's click and the menu's toggle can report the same
  // close in one gesture; this is what makes the second report a no-op.
  const openNow = useRef(open);
  openNow.current = open;

  const setOpen = useCallback((next: boolean) => {
    if (openNow.current === next) return;
    openNow.current = next;
    setOpenState(next);
  }, []);
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
      <Button
        {...buttonProps}
        ref={triggerRef}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onPointerDown={(e) => {
          buttonProps.onPointerDown?.(e);
          // Decide here, not on click. Pressing the trigger while the menu is
          // open is an outside press to the platform, which closes the menu
          // during pointerdown — so by click the menu already reads as shut
          // and a plain toggle would reopen it. The toggle event cannot
          // settle it either: it fires after click. What the reader meant is
          // knowable only at the moment they pressed.
          //
          // This replaces a 300ms timer that ignored trigger clicks after any
          // close. Escape armed it too, so a click shortly after Escape was
          // silently swallowed.
          pressIntent.current = !openNow.current;
        }}
        onKeyDown={(e) => {
          buttonProps.onKeyDown?.(e);
          // A press dragged off the button never clicks, which would leave its
          // intent behind to hijack the next Enter or Space. Keys decide fresh.
          if (e.key === "Enter" || e.key === " ") pressIntent.current = null;
        }}
        onClick={(e) => {
          buttonProps.onClick?.(e);
          // Keyboard activation has no pointerdown, so it falls back to a
          // straight toggle — Enter and Space never light-dismiss.
          const next = pressIntent.current ?? !openNow.current;
          pressIntent.current = null;
          setOpen(next);
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
          // A platform close — a press elsewhere or Escape — synced into
          // state. setOpen ignores a close already recorded, such as one an
          // Item or the trigger asked for.
          if ((e.nativeEvent as ToggleEvent).newState === "closed") setOpen(false);
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
  const cls = cx(styles.item, color === "danger" && styles.danger);
  const activate = () => {
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
