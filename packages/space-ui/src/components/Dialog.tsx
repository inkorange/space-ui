// src/components/ui/Dialog.tsx
// Compound Dialog matching the Radix JSX shape on a native <dialog>:
// top-layer stacking (nested/stacked dialogs work), built-in focus trap and
// focus return, Esc via the `cancel` event. Both controlled (open/
// onOpenChange) and Trigger-driven uncontrolled sites are supported — the
// inventory has both. Esc handoff with the in-house Select: a capture-phase
// keydown checks for an open listbox inside the dialog and flags the next
// `cancel` to be swallowed, so one Esc closes the Select, the next closes
// the dialog (matching the Radix-era behavior sites were built against).
"use client";
import type * as React from "react";
import { XIcon } from "./icons";
import {
  cloneElement, createContext, isValidElement, useContext, useEffect,
  useId, useLayoutEffect, useRef, useState, type ReactNode,
} from "react";
import { cx } from "./propShared";
import { Heading, type HeadingProps } from "./Heading";
import { Text, type TextProps } from "./Text";
import styles from "./Dialog.module.scss";

// Body scroll-lock reference count, shared across every mounted Content
// instance (module scope, not per-instance state) — Dialog and AlertDialog
// stack on top of one another, and per-instance prev-capture couldn't tell
// "I'm the last one closing" from "another instance is still open" when
// unmounts land out of open-order. A plain 0→1 / 1→0 edge count is
// order-proof: overflow is locked exactly while count > 0, regardless of
// which instance opened or closed first.
let lockCount = 0;

export interface DialogCtx {
  open: boolean;
  setOpen: (o: boolean) => void;
  titleId: string;
  descId: string;
  /** alert dialogs: no backdrop light-dismiss */
  alert?: boolean;
  /** whether a Description is currently mounted (drives aria-describedby) */
  hasDesc: boolean;
  setHasDesc: (v: boolean) => void;
}
const Ctx = createContext<DialogCtx | null>(null);
export const useDialog = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Dialog parts must be inside a Dialog");
  return ctx;
};

export interface DialogProps {
  /** Controls the dialog. Omit both this and onOpenChange to let the dialog
   *  manage its own state. */
  open?: boolean;
  /** Called whenever the dialog opens or closes, including via Escape or a
   *  backdrop click. */
  onOpenChange?: (o: boolean) => void;
  /** A `Trigger` and a `Content`, in any arrangement — this renders
   *  nothing itself, so they can sit anywhere beneath it. */
  children?: ReactNode;
}

/** Shared by Dialog and AlertDialog; only the alert flag differs. */
export function makeRoot(alert: boolean) {
  return function DialogRoot({ open, onOpenChange, children }: DialogProps) {
    const [internal, setInternal] = useState(false);
    const isControlled = open !== undefined;
    const actual = isControlled ? open : internal;
    const setOpen = (o: boolean) => {
      if (!isControlled) setInternal(o);
      onOpenChange?.(o);
    };
    const titleId = useId();
    const descId = useId();
    const [hasDesc, setHasDesc] = useState(false);
    return (
      <Ctx.Provider value={{ open: actual, setOpen, titleId, descId, alert, hasDesc, setHasDesc }}>
        {children}
      </Ctx.Provider>
    );
  };
}
/**
 * Owns a dialog's open state. Works controlled via `open`/`onOpenChange`, or
 * uncontrolled if you pass neither.
 *
 * Renders nothing itself — it only provides context, so Trigger and Content
 * can sit anywhere beneath it in the tree.
 */
const Root = makeRoot(false);

type Clickable = React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
const chainOpen = (child: ReactNode, fn: () => void): ReactNode => {
  if (!isValidElement(child)) return child;
  const c = child as Clickable;
  return cloneElement(c, {
    onClick: (e: React.MouseEvent) => { c.props.onClick?.(e); fn(); },
  });
};

/**
 * Opens the dialog. Chains onto its child's existing click handler rather
 * than replacing it, and renders no element of its own — so the child stays
 * whatever it already was, button or otherwise.
 */
export function Trigger({
  children,
}: {
  /** The control that opens the dialog. Its own onClick still fires. */
  children?: ReactNode;
}) {
  const d = useDialog();
  return <>{chainOpen(children, () => d.setOpen(true))}</>;
}

/**
 * Closes the dialog. Same shape as Trigger: wraps its child, adds a close on
 * click, and adds no markup.
 */
export function Close({
  children,
}: {
  /** The control that closes the dialog. Its own onClick still fires. */
  children?: ReactNode;
}) {
  const d = useDialog();
  return <>{chainOpen(children, () => d.setOpen(false))}</>;
}

export interface ContentProps extends React.HTMLAttributes<HTMLDialogElement> {
  /** Padding and radius step. 4 is roomier, for dialogs carrying a form. */
  size?: "3" | "4";
  /** Caps the dialog's width, e.g. "480px". Without it the dialog uses its
   *  own default and grows with its content. */
  maxWidth?: string;
  /** Dialog contents. Include a Title — it is the accessible name. */
  children?: ReactNode;
}

/**
 * The dialog surface. Built on the native `<dialog>` element, so the browser
 * supplies the top layer, focus trapping and Escape handling rather than the
 * library reimplementing them.
 *
 * Dismissible by Escape or a click on the backdrop; AlertDialog's Content
 * deliberately is not.
 */
export function Content({ size = "3", maxWidth, className, style, children, ...rest }: ContentProps) {
  const d = useDialog();
  const ref = useRef<HTMLDialogElement | null>(null);
  const swallowCancel = useRef(false);
  // Backdrop dismissal must require BOTH the mousedown/pointerdown AND the
  // click to land on the backdrop (the <dialog> element itself, not the
  // inner content wrapper) — otherwise a text-selection drag that starts in
  // the content and ends up released over the backdrop would close the
  // dialog on mouseup even though the gesture began inside it.
  const pointerDownOnBackdrop = useRef(false);

  // Imperative <dialog> API follows the declarative open prop (handles the
  // delayed first open of AccountsIntroModal's 900ms timer too).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (d.open && !el.open) el.showModal();
    else if (!d.open && el.open) el.close();
  }, [d.open]);

  // Body scroll lock while open (Radix did this; panels behind rely on it).
  // Module-level counter (see `lockCount` above) so stacked dialogs compose:
  // only the 0→1 transition locks, only the 1→0 transition unlocks.
  useEffect(() => {
    if (!d.open) return;
    lockCount += 1;
    if (lockCount === 1) document.body.style.overflow = "hidden";
    return () => {
      lockCount -= 1;
      if (lockCount === 0) document.body.style.overflow = "";
    };
  }, [d.open]);

  return (
    <dialog
      {...rest}
      ref={ref}
      role={d.alert ? "alertdialog" : undefined}
      aria-labelledby={d.titleId}
      aria-describedby={d.hasDesc ? d.descId : undefined}
      className={cx(styles.dialog, "spDialog", size === "4" && styles.size4, className)}
      style={{ ...(maxWidth ? { maxWidth } : null), ...style }}
      onKeyDownCapture={(e) => {
        if (e.key !== "Escape") return;
        // A nested dialog is open inside this one (e.g. an AlertDialog
        // launched from this dialog's content) — that inner dialog owns
        // this Esc; don't let the outer one arm its own swallow logic on
        // an event that's about to close a dialog it isn't itself.
        if (ref.current?.querySelector("dialog[open]")) return;
        // Esc while an in-house Select's listbox is open inside this dialog:
        // the Select closes itself; swallow the dialog's own cancel.
        if (ref.current?.querySelector('[role="listbox"]:not([hidden])')) {
          swallowCancel.current = true;
        }
      }}
      onCancel={(e) => {
        e.preventDefault(); // we route ALL closes through React state
        if (swallowCancel.current) { swallowCancel.current = false; return; }
        d.setOpen(false);
      }}
      onClose={() => {
        // Belt-and-suspenders: any UA-initiated close we didn't route
        // through onCancel (a non-cancelable close request, or a future
        // method="dialog" form submission inside the content) still fires
        // `close`. Resync React state so `open` doesn't get stranded true
        // while the native element is actually closed.
        if (d.open) d.setOpen(false);
      }}
      onPointerDown={(e) => {
        pointerDownOnBackdrop.current = e.target === ref.current;
      }}
      onClick={(e) => {
        // Backdrop click = clicking the <dialog> element itself (the inner
        // wrapper covers the content area). Alert dialogs don't light-dismiss.
        // Require the pointerdown that started this click to have also
        // landed on the backdrop, so a text-selection drag from the content
        // out to the backdrop doesn't close the dialog on release.
        if (!d.alert && e.target === ref.current && pointerDownOnBackdrop.current) d.setOpen(false);
      }}
    >
      <div className={styles.inner}>
        {/* Every dialog gets the same dismiss affordance in the same place.
            Alert dialogs are excluded on purpose: they ask a question that
            wants an explicit answer, and a corner X is an ambiguous one. */}
        {!d.alert && (
          <button
            type="button"
            className={styles.closeX}
            aria-label="Close"
            onClick={() => d.setOpen(false)}
          >
            <XIcon width={16} height={16} />
          </button>
        )}
        {children}
      </div>
    </dialog>
  );
}

/**
 * The dialog's accessible name. Wire one up for every dialog — it is what a
 * screen reader announces when the dialog opens.
 */
export function Title({ className, ...rest }: HeadingProps) {
  const d = useDialog();
  return <Heading as="h2" size="5" {...rest} id={d.titleId} className={cx(styles.title, className)} />;
}

/**
 * Supporting copy beneath the title, registered as the dialog's accessible
 * description. Optional, and only announced when present.
 */
export function Description(props: TextProps) {
  const d = useDialog();
  // aria-describedby on Content is conditional on a Description actually
  // being mounted (some dialogs render none), so Content can't just point
  // at descId unconditionally. Register/unregister via a layout effect —
  // runs before paint, and Description mounts synchronously with the
  // dialog's content, so there's no visible flash of a missing attribute.
  // Depend on setHasDesc alone (a stable useState setter), not the whole
  // `d` context object — that object is a fresh literal every Root render,
  // so depending on it would re-fire this effect (and its cleanup) on
  // every render instead of just mount/unmount.
  const { setHasDesc } = d;
  useLayoutEffect(() => {
    setHasDesc(true);
    return () => setHasDesc(false);
  }, [setHasDesc]);
  return <Text as="p" {...props} id={d.descId} />;
}

// The parts hang off the component rather than being separate exports, so the
// whole API is reachable from the one name a consumer already imported. They
// stay exported above too, because AlertDialog is assembled from them.
export const Dialog = Object.assign(Root, {
  Trigger,
  Close,
  Content,
  Title,
  Description,
});
