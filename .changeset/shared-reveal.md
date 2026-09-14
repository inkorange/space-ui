---
"@inkorange/space-ui": minor
---

Everything that appears and disappears now reveals and dismisses the same way:
Popover, Tooltip, DropdownMenu, the Select and Autocomplete panels, and Dialog
with AlertDialog.

On reveal a surface glides eight pixels into place while fading in — opaque in
about 120ms, still settling to about 380ms, so it is readable almost at once
and then settles rather than snapping. Dismissal is a quicker fade, and the
surface stays rendered until it has finished. Dialog's backdrop dims in and
out with its panel.

Before this, Tooltip and Dialog each had their own short entry keyframe and no
exit at all, and DropdownMenu, Select and Autocomplete appeared and vanished
instantly. The timing now lives in one place, so they cannot drift apart
again.

A surface that can open on more than one side travels away from its trigger on
whichever side it lands — a tooltip flipped above rises, one to the right of a
control slides right. Reduced motion drops the travel everywhere and keeps a
brief fade. Browsers without `@starting-style` show and hide without motion.
