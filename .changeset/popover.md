---
"@inkorange/space-ui": minor
---

New `Popover`: a button that opens a floating panel of anything.

```tsx
<Popover label="Filter planets" align="end">
  <FilterForm />
</Popover>
```

The trigger is always a Button, so `size`, `iconOnly` and the rest of
`ButtonProps` shape it directly; the children are the panel. For a list of
actions use DropdownMenu, and for a line of text, Tooltip.

It rides the browser's own popover layer, so the panel stacks above everything
without a z-index arms race and closes on Escape or a press elsewhere by the
platform's rules. It flips above its trigger when there is no room below, and
stays attached when the page scrolls or the layout around it shifts. Opening
moves focus to the panel's first control; Escape hands focus back to the
trigger. Controlled through `open` and `onOpenChange`, or left to manage
itself, with `defaultOpen` to show it on arrival without taking focus.

It reveals with a short glide away from its trigger and a quicker fade, so it
is readable almost at once and then settles, and dismisses faster still — a
reader who closed something has already moved on. When it flips above its
trigger it rises into place rather than falling. Reduced motion drops the
travel and keeps only a brief fade.

The stickersheet now shows an open Popover and a Pagination, and the README's
image is recaptured from it.
