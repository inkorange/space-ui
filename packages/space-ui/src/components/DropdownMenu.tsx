// src/components/ui/DropdownMenu.tsx
// role="menu" on a popover="auto" div: top-layer + click-outside dismissal
// come from the platform. Anchor positioning is manual (align="end" is the
// only inventoried mode). Roving tabindex arrows per the spec.
"use client";
import type * as React from "react";
import {
  cloneElement, createContext, createElement, isValidElement, useContext,
  useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode,
} from "react";
import { cx } from "./propShared";
import styles from "./DropdownMenu.module.scss";

interface MenuCtx {
  open: boolean;
  setOpen: (o: boolean) => void;
  menuId: string;
}
const Ctx = createContext<MenuCtx | null>(null);
const useMenu = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("DropdownMenu parts must be inside DropdownMenu.Root");
  return ctx;
};

// Refs live in their own contexts (not bundled into MenuCtx) so `ref={...}`
// attachment in JSX reads a plain RefObject, matching the pattern Select.tsx
// uses for its trigger ref.
const TriggerRefCtx = createContext<React.RefObject<HTMLElement | null> | null>(null);
const useTriggerRef = () => {
  const ref = useContext(TriggerRefCtx);
  if (!ref) throw new Error("DropdownMenu parts must be inside DropdownMenu.Root");
  return ref;
};
const MenuRefCtx = createContext<React.RefObject<HTMLDivElement | null> | null>(null);
const useMenuRef = () => {
  const ref = useContext(MenuRefCtx);
  if (!ref) throw new Error("DropdownMenu parts must be inside DropdownMenu.Root");
  return ref;
};

// Whether a platform light-dismiss just closed the popover (cleared after a
// short window by a timeout — see Content's onToggle). Own context per the
// ref-context pattern above (refs never live on Ctx itself — react-hooks/
// refs forbids mutable refs on a value object that's also read for render,
// since a ref write wouldn't trigger the re-render consumers of Ctx expect).
const LightDismissRefCtx = createContext<React.RefObject<boolean> | null>(null);
const useLightDismissRef = () => {
  const ref = useContext(LightDismissRefCtx);
  if (!ref) throw new Error("DropdownMenu parts must be inside DropdownMenu.Root");
  return ref;
};

// Whether the popover's current "closed" toggle was initiated by an Item
// activating (click/asChild-navigate) rather than a platform light-dismiss
// (click outside / Esc). Item arms this just before it calls setOpen(false);
// Content's onToggle reads-and-clears it to decide whether to arm the
// light-dismiss race guard above — an item-initiated close shouldn't be
// mistaken for an outside click. Own ref-context, same reasoning as
// LightDismissRefCtx.
const ItemClosedRefCtx = createContext<React.RefObject<boolean> | null>(null);
const useItemClosedRef = () => {
  const ref = useContext(ItemClosedRefCtx);
  if (!ref) throw new Error("DropdownMenu parts must be inside DropdownMenu.Root");
  return ref;
};

// Plain (non-component, non-hook) helper: reads-and-clears the flag. Kept
// outside Trigger's body because closures passed through cloneElement's
// props object aren't recognized as deferred event handlers by the React
// Compiler's ref-during-render check the way a literal JSX attribute value
// is — pulling the `.current` access out into an ordinary function sidesteps
// that false positive (the closure in Trigger only ever calls this helper,
// it never touches `.current` itself).
function consumeLightDismissFlag(ref: React.RefObject<boolean>): boolean {
  if (!ref.current) return false;
  ref.current = false;
  return true;
}

// Same false-positive, same fix: Item's asChild onClick is built inside the
// props object passed to createElement (not a literal JSX attribute), so a
// direct `.current` write there trips the same ref-during-render check.
function markItemInitiatedClose(ref: React.RefObject<boolean>): void {
  ref.current = true;
}

export function Root({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const lightDismissedRef = useRef(false);
  const itemClosedRef = useRef(false);
  return (
    <Ctx.Provider value={{ open, setOpen, menuId }}>
      <TriggerRefCtx.Provider value={triggerRef}>
        <MenuRefCtx.Provider value={menuRef}>
          <LightDismissRefCtx.Provider value={lightDismissedRef}>
            <ItemClosedRefCtx.Provider value={itemClosedRef}>{children}</ItemClosedRefCtx.Provider>
          </LightDismissRefCtx.Provider>
        </MenuRefCtx.Provider>
      </TriggerRefCtx.Provider>
    </Ctx.Provider>
  );
}

export function Trigger({ children }: { children?: ReactNode }) {
  const m = useMenu();
  const triggerRef = useTriggerRef();
  const lightDismissedRef = useLightDismissRef();
  if (!isValidElement(children)) return null;
  const child = children as React.ReactElement<Record<string, unknown>>;
  return cloneElement(child, {
    ref: triggerRef,
    "aria-haspopup": "menu",
    "aria-expanded": m.open,
    "aria-controls": m.menuId,
    onClick: (e: React.MouseEvent) => {
      (child.props.onClick as ((e: React.MouseEvent) => void) | undefined)?.(e);
      // Race: clicking the trigger while the menu is open first fires a
      // pointerdown, which the popover API treats as an outside interaction
      // and light-dismisses the popover (Content's onToggle flags this ref
      // and clears it again after a short window — see there). The click
      // event that completes right after would then read the now-stale
      // open===false and immediately reopen the menu it was meant to close.
      // Skip this click's toggle if a light-dismiss just landed within the
      // same gesture.
      if (consumeLightDismissFlag(lightDismissedRef)) return;
      m.setOpen(!m.open);
    },
  });
}

export function Content({ align = "start", children }: { align?: "start" | "end"; children?: ReactNode }) {
  const m = useMenu();
  const triggerRef = useTriggerRef();
  const menuRef = useMenuRef();
  const lightDismissedRef = useLightDismissRef();
  const itemClosedRef = useItemClosedRef();
  const [pos, setPos] = useState<{ top: number; left: number | "auto"; right: number | "auto" } | null>(null);

  // useLayoutEffect (not useEffect) so the position is measured and applied
  // synchronously before paint — matches Select.tsx's trigger-measurement
  // pattern and avoids a one-frame flash at the wrong coordinates.
  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    if (m.open) {
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
  }, [m.open, align, menuRef, triggerRef]);

  // A resize invalidates the anchored position (measured once, at open) —
  // rather than re-measuring on every resize tick, just close the menu, same
  // as a light dismiss.
  useEffect(() => {
    if (!m.open) return;
    const setOpen = m.setOpen;
    const onResize = () => setOpen(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [m.open, m.setOpen]);

  return (
    <div
      ref={menuRef}
      id={m.menuId}
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
          // hidePopover() → this same toggle event) — that's not a light
          // dismiss and shouldn't arm the race guard below. Read-and-clear
          // the item's flag to tell the two apart.
          const itemInitiated = itemClosedRef.current;
          itemClosedRef.current = false;
          if (!itemInitiated) {
            // Flag the race window for Trigger's onClick (see the comment
            // there) and auto-clear it shortly after — it only needs to
            // survive the current click gesture, not linger indefinitely.
            lightDismissedRef.current = true;
            setTimeout(() => { lightDismissedRef.current = false; }, 300);
          }
          if (m.open) m.setOpen(false);
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
        else if (e.key === "Escape") { m.setOpen(false); triggerRef.current?.focus(); }
      }}
    >
      {children}
    </div>
  );
}

export function Label({ children }: { children?: ReactNode }) {
  return <div className={styles.label}>{children}</div>;
}

export interface ItemProps {
  asChild?: boolean;
  color?: "red";
  onSelect?: () => void | Promise<void>;
  children?: ReactNode;
}

export function Item({ asChild, color, onSelect, children }: ItemProps) {
  const m = useMenu();
  const itemClosedRef = useItemClosedRef();
  const cls = cx(styles.item, color === "red" && styles.danger);
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

export function Separator() {
  return <div role="separator" className={styles.separator} />;
}
