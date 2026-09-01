// The same native-<dialog> engine as Dialog, with alertdialog semantics:
// role="alertdialog", and NO backdrop light-dismiss — an alert is a decision,
// so it does not go away because you clicked beside it. Render Cancel before
// Action so showModal()'s initial focus lands on the safe choice.
"use client";
import {
  makeRoot, Trigger, Close,
  Content, Title, Description,
  type DialogProps,
} from "./Dialog";

export type { DialogProps as AlertDialogProps };

// Cancel and Action are the same component under two names. The name is the
// point: it says which one is destructive at the call site, and it makes the
// ordering rule above readable rather than positional trivia. Close chains
// the child's own onClick before closing, so an Action's handler runs first.
const Cancel = Close;
const Action = Close;

/**
 * A modal that interrupts to confirm something consequential.
 *
 * Unlike a Dialog it has no backdrop dismissal, because dismissing an alert
 * by missing it is not a decision. Put `Cancel` before `Action` so the safe
 * choice takes focus when it opens.
 */
export const AlertDialog = Object.assign(makeRoot(true), {
  Trigger,
  Content,
  Title,
  Description,
  Cancel,
  Action,
});
