// src/components/ui/AlertDialog.tsx
// Same native-<dialog> engine with alertdialog semantics: role="alertdialog",
// NO backdrop light-dismiss (spec), and sites render Cancel before Action so
// showModal()'s first-focusable initial focus lands on Cancel (spec).
"use client";
import {
  makeRoot, Trigger as DialogTrigger, Close as DialogClose,
  Content as DialogContent, Title as DialogTitle, Description as DialogDescription,
} from "./Dialog";

export const Root = makeRoot(true);
export const Trigger = DialogTrigger;
export const Content = DialogContent;
export const Title = DialogTitle;
export const Description = DialogDescription;
export const Cancel = DialogClose;
// Close chains the child's own onClick (the destructive handler) BEFORE
// closing — exactly AlertDialog.Action's Radix contract. Distinct export so
// call sites keep their names.
export const Action = DialogClose;
