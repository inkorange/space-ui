"use client";
import type * as React from "react";
import {
  useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode,
} from "react";
import { cx } from "./propShared";
import { Button, type ButtonProps } from "./Button";
import styles from "./Popover.module.scss";
import ctl from "../styles/spaceControls";

const OFFSET = 8;
const EDGE_PADDING = 8;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface PopoverProps extends Omit<ButtonProps, "children"> {
  /** What the trigger shows. The trigger is always a Button, so this is its
   *  content — text, or an icon with `iconOnly` and an `aria-label`. */
  label: ReactNode;
  /** The panel's contents. Anything: a form, a filter set, a prompt. For a
   *  list of actions reach for DropdownMenu; for a line of text, Tooltip. */
  children?: ReactNode;
  /** Controls the panel. Omit both this and `onOpenChange` to let the popover
   *  manage itself. */
  open?: boolean;
  /** Called whenever the panel opens or closes, including by Escape or a
   *  click elsewhere. */
  onOpenChange?: (open: boolean) => void;
  /** Open on first render when uncontrolled. Focus is left where it is, so a
   *  popover shown on arrival never steals the page's focus. */
  defaultOpen?: boolean;
  /** Which side of the trigger the panel prefers. It flips to the other side
   *  when there is no room. Default `bottom`. */
  side?: "top" | "bottom";
  /** Which edge of the trigger the panel lines up with. Use `end` for a
   *  trigger near the right of the viewport. Default `start`. */
  align?: "start" | "center" | "end";
  /** Merged onto the panel. */
  panelClassName?: string;
}

/**
 * A button that opens a floating panel of anything — a small form, a set of
 * filters, a prompt — without leaving the page.
 *
 * It rides the browser's own popover layer, so the panel stacks above
 * everything without a z-index arms race and closes on Escape or a click
 * elsewhere by the platform's rules rather than an approximation of them. It
 * sits next to its trigger, flips above it when there is no room below, and
 * stays attached to it if the page scrolls or the layout around it shifts.
 *
 * Opening moves focus into the panel so a keyboard user lands on its first
 * control; closing with Escape hands focus back to the trigger. The panel is
 * labelled by the trigger, so it announces as what the button said it was.
 */
export function Popover({
  label,
  children,
  open: openProp,
  onOpenChange,
  defaultOpen = false,
  side = "bottom",
  align = "start",
  panelClassName,
  onClick,
  ...buttonProps
}: PopoverProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : internal;

  const triggerId = useId();
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number; placed: "top" | "bottom" } | null>(null);

  // Whether the next open came from the reader, as opposed to defaultOpen on
  // mount. Only a reader's open moves focus.
  const openedByReader = useRef(false);
  // Set by Escape inside the panel, so the close that follows returns focus.
  const closingByEscape = useRef(false);
  // What a pointer press on the trigger meant, decided at pointerdown — before
  // the platform has had a chance to light-dismiss. See the trigger below.
  const pressIntent = useRef<boolean | null>(null);
  // The latest open state, including one requested this tick but not yet
  // rendered. Both the trigger's click and the panel's toggle can report the
  // same close in one gesture; this is what stops onOpenChange hearing twice.
  const openNow = useRef(open);
  openNow.current = open;

  const setOpen = useCallback(
    (next: boolean) => {
      if (openNow.current === next) return;
      openNow.current = next;
      if (!controlled) setInternal(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  const place = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;
    const r = trigger.getBoundingClientRect();
    const w = panel.offsetWidth;
    const h = panel.offsetHeight;

    const below = r.bottom + OFFSET;
    const above = r.top - h - OFFSET;
    const fitsBelow = below + h <= window.innerHeight - EDGE_PADDING;
    const fitsAbove = above >= EDGE_PADDING;
    const top = side === "bottom"
      ? (fitsBelow || !fitsAbove ? below : above)
      : (fitsAbove || !fitsBelow ? above : below);
    // Where it actually landed after any flip, so the reveal can travel away
    // from the trigger rather than towards it. Written to the element as well
    // as to state: the reveal reads it before React has re-rendered.
    const placed = top === below ? "bottom" : "top";
    panel.dataset.side = placed;

    const wanted =
      align === "start" ? r.left : align === "end" ? r.right - w : r.left + r.width / 2 - w / 2;
    const left = Math.min(
      Math.max(wanted, EDGE_PADDING),
      Math.max(window.innerWidth - w - EDGE_PADDING, EDGE_PADDING),
    );
    setPos((prev) =>
      prev && prev.top === top && prev.left === left && prev.placed === placed
        ? prev
        : { top, left, placed },
    );
  }, [side, align]);

  // Show before measuring: while the panel is display:none its size reads 0
  // and every clamp above would be computed against nothing. Layout effect,
  // so the corrected position lands before the first frame is painted.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (open) {
      if (!panel.matches(":popover-open")) {
        // Decide the side BEFORE revealing. The reveal's starting offset is
        // captured the instant the panel first renders, and which way it
        // should travel depends on whether it flips — which needs its size,
        // which needs it rendered. Showing first and measuring after locked a
        // flipped panel into sliding down towards its own trigger. So it is
        // measured while invisible and outside the transition, then returned
        // to unrendered and committed there, so the real reveal still starts
        // fresh from its starting style.
        //
        // Transitions stay off until it is unrendered again. The dismissal
        // transition keeps a closing panel rendered while it fades, so
        // stepping out of the measurement with it on counted as a dismissal:
        // the panel stayed alive animating its offset, and the reveal then
        // started from that live value instead of from its starting style.
        panel.dataset.instant = "";
        panel.dataset.measuring = "";
        place();
        delete panel.dataset.measuring;
        void panel.offsetWidth;
        delete panel.dataset.instant;
        void panel.offsetWidth;
        panel.showPopover();
      }
      place();
      if (openedByReader.current) {
        openedByReader.current = false;
        const first = panel.querySelector<HTMLElement>(FOCUSABLE);
        (first ?? panel).focus({ preventScroll: true });
      }
    } else if (panel.matches(":popover-open")) {
      panel.hidePopover();
    }
  }, [open, place]);

  // Follow the trigger for as long as the panel is open. Scroll and resize
  // listeners were not enough: anything that moves the trigger without
  // scrolling — an image loading above it, a font swapping in, a sibling
  // growing — left the panel where it opened, detached from its button and
  // sometimes sitting on top of it. So each frame compares where the trigger
  // is now with where it was, and re-places only on a change. One layout read
  // a frame, and only while open.
  useEffect(() => {
    if (!open) return;
    let frame = 0;
    let last = "";
    const track = () => {
      const trigger = triggerRef.current;
      const panel = panelRef.current;
      if (trigger && panel) {
        const r = trigger.getBoundingClientRect();
        const key = `${r.top}|${r.left}|${r.width}|${r.height}|${panel.offsetWidth}|${panel.offsetHeight}|${window.innerWidth}|${window.innerHeight}`;
        if (key !== last) {
          last = key;
          place();
        }
      }
      frame = requestAnimationFrame(track);
    };
    frame = requestAnimationFrame(track);
    return () => cancelAnimationFrame(frame);
  }, [open, place]);

  return (
    <>
      <Button
        {...buttonProps}
        ref={triggerRef}
        id={triggerId}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onPointerDown={(e) => {
          buttonProps.onPointerDown?.(e);
          // Decide here, not on click. Pressing the trigger while the panel is
          // open is an outside press to the platform, which closes the panel
          // during pointerdown — so by the time click runs, the panel already
          // reads as shut and a plain toggle would reopen it. The platform's
          // toggle event cannot settle it either: it fires after click. What
          // the reader meant is knowable only at the moment they pressed.
          pressIntent.current = !openNow.current;
        }}
        onKeyDown={(e) => {
          buttonProps.onKeyDown?.(e);
          // A press dragged off the button never clicks, which would leave its
          // intent behind to hijack the next Enter or Space. Keys decide fresh.
          if (e.key === "Enter" || e.key === " ") pressIntent.current = null;
        }}
        onClick={(e) => {
          onClick?.(e);
          // Keyboard activation has no pointerdown, so it falls back to a
          // straight toggle, which is right: Enter and Space never light-dismiss.
          const next = pressIntent.current ?? !openNow.current;
          pressIntent.current = null;
          if (next) openedByReader.current = true;
          setOpen(next);
        }}
      >
        {label}
      </Button>

      <div
        ref={panelRef}
        id={panelId}
        popover="auto"
        role="dialog"
        aria-labelledby={triggerId}
        tabIndex={-1}
        className={cx(styles.panel, ctl.spacePanel, panelClassName)}
        data-animated={buttonProps.animated === false ? "false" : undefined}
        data-side={pos?.placed ?? side}
        style={pos ? { top: pos.top, left: pos.left } : undefined}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            closingByEscape.current = true;
            // Only this popover. An enclosing Dialog must not close with it.
            e.stopPropagation();
          }
        }}
        onToggle={(e: React.SyntheticEvent<HTMLDivElement>) => {
          if ((e.nativeEvent as ToggleEvent).newState !== "closed") return;
          if (closingByEscape.current) {
            closingByEscape.current = false;
            triggerRef.current?.focus();
          }
          // The platform closed it — a press elsewhere or Escape. setOpen
          // ignores a close this component has already recorded.
          setOpen(false);
        }}
      >
        {children}
      </div>
    </>
  );
}
