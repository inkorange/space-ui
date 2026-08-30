"use client";

// Generic hover/focus tooltip for icon-only controls. Built on the same
// native popover="auto" top-layer pattern as ElementTooltip (and
// DropdownMenu) rather than a library: Radix is gone from this app, and the
// platform gives Escape/click-outside dismissal and top-layer stacking for
// free — which matters here because these triggers sit over WebGL canvases
// and inside their own stacking contexts.
//
// Deliberately NOT the native `title` attribute, which these controls used
// before: the browser's own tooltip waits about a second, cannot be styled
// to match the app, and never appears for keyboard users at all.

import {
  cloneElement, isValidElement, useEffect, useId, useLayoutEffect, useRef, useState,
} from "react";
import styles from "./Tooltip.module.scss";

interface TooltipProps {
  /** The text to show. Nothing renders when this is empty. */
  label: string;
  /** Preferred side; flips automatically when there isn't room. */
  side?: "top" | "bottom";
  children: React.ReactElement;
}

const SHOW_DELAY = 350;
const HIDE_DELAY = 80;
const SIDE_OFFSET = 8;
const COLLISION_PADDING = 8;

// The clone lives in its own component so this scope never dereferences
// triggerRef itself — the React Compiler flags a ref that is BOTH passed
// into cloneElement's props and read in the same scope. Same split, and the
// same reason, as ElementTooltip's TooltipTrigger.
interface TriggerProps {
  triggerRef: React.RefObject<HTMLElement | null>;
  tooltipId: string;
  show: (immediate?: boolean) => void;
  hide: () => void;
  children: React.ReactElement<Record<string, unknown>>;
}
function TooltipTrigger({ triggerRef, tooltipId, show, hide, children }: TriggerProps) {
  const p = children.props;
  return cloneElement(children, {
    ref: triggerRef,
    // Always present, so the id it points at never dangles: the content
    // element stays mounted and only toggles its popover state.
    "aria-describedby": tooltipId,
    onPointerEnter: (e: React.PointerEvent) => {
      (p.onPointerEnter as ((e: React.PointerEvent) => void) | undefined)?.(e);
      // Mouse only. A touch "hover" fires on tap, which would pop a tooltip
      // over the very control the user just pressed.
      if (e.pointerType === "mouse") show();
    },
    onPointerLeave: (e: React.PointerEvent) => {
      (p.onPointerLeave as ((e: React.PointerEvent) => void) | undefined)?.(e);
      hide();
    },
    // Keyboard focus shows it immediately — no hover delay to wait out.
    onFocus: (e: React.FocusEvent) => {
      (p.onFocus as ((e: React.FocusEvent) => void) | undefined)?.(e);
      show(true);
    },
    onBlur: (e: React.FocusEvent) => {
      (p.onBlur as ((e: React.FocusEvent) => void) | undefined)?.(e);
      hide();
    },
    // A tooltip must never outlive the action it describes: clicking the
    // control (expand, switch view) leaves it stranded over the new layout.
    onClick: (e: React.MouseEvent) => {
      (p.onClick as ((e: React.MouseEvent) => void) | undefined)?.(e);
      hide();
    },
  });
}

export function Tooltip({ label, side = "bottom", children }: TooltipProps) {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (showTimer.current) { clearTimeout(showTimer.current); showTimer.current = null; }
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
  };
  const show = (immediate = false) => {
    clearTimers();
    if (immediate) { setOpen(true); return; }
    showTimer.current = setTimeout(() => setOpen(true), SHOW_DELAY);
  };
  const hide = () => {
    clearTimers();
    hideTimer.current = setTimeout(() => setOpen(false), HIDE_DELAY);
  };

  useEffect(() => clearTimers, []);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    if (!open) {
      if (content.matches(":popover-open")) content.hidePopover();
      return;
    }
    // Show before measuring: while display:none the offset sizes read 0 and
    // every clamp below would be computed against nothing.
    if (!content.matches(":popover-open")) content.showPopover();
    const trigger = triggerRef.current;
    if (!trigger) return;
    const r = trigger.getBoundingClientRect();
    const w = content.offsetWidth;
    const h = content.offsetHeight;

    // Flip to the other side when the preferred one has no room — these
    // controls sit in both the top row and the bottom action bar.
    const below = r.bottom + SIDE_OFFSET;
    const above = r.top - h - SIDE_OFFSET;
    const fitsBelow = below + h <= window.innerHeight - COLLISION_PADDING;
    const fitsAbove = above >= COLLISION_PADDING;
    const top = side === "bottom"
      ? (fitsBelow || !fitsAbove ? below : above)
      : (fitsAbove || !fitsBelow ? above : below);

    // Centred on the trigger, clamped inside the viewport.
    const left = Math.min(
      Math.max(r.left + r.width / 2 - w / 2, COLLISION_PADDING),
      Math.max(window.innerWidth - w - COLLISION_PADDING, COLLISION_PADDING),
    );
    setPos({ top, left });
  }, [open, side, label]);

  if (!label || !isValidElement(children)) return <>{children}</>;

  return (
    <>
      <TooltipTrigger
        triggerRef={triggerRef}
        tooltipId={tooltipId}
        show={show}
        hide={hide}
      >
        {children as React.ReactElement<Record<string, unknown>>}
      </TooltipTrigger>
      <div
        ref={contentRef}
        id={tooltipId}
        popover="auto"
        role="tooltip"
        className={styles.content}
        style={pos ? { top: pos.top, left: pos.left } : undefined}
        onToggle={(e: React.SyntheticEvent<HTMLDivElement>) => {
          if ((e.nativeEvent as ToggleEvent).newState === "closed" && open) setOpen(false);
        }}
      >
        {label}
      </div>
    </>
  );
}
