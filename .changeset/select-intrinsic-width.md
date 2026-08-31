---
"@inkorange/space-ui": minor
---

`Select.Trigger` now sizes itself to its widest option.

Previously the trigger was as wide as whatever was selected, so it changed
width every time you picked something — and every call site papered over it
with an inline `minWidth`, which is the component's job, not the caller's.

The trigger renders a hidden, aria-hidden copy of every option label (and the
placeholder) stacked in the same grid cell as the visible one, so its width is
the widest thing it could ever show. Capped by
`--sp-select-trigger-max-width` (default `20rem`), past which the label
ellipsizes.

**Migration:** remove `style={{ minWidth: … }}` from `Select.Trigger` call
sites; it is no longer needed. Set `--sp-select-trigger-max-width` to change
the cap.
