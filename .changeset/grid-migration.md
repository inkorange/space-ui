---
"@inkorange/space-ui": minor
---

Put the whole library on the spacing grid, and size type in rem.

**Control heights are a ladder, from tokens.** `--sp-control-height-sm` (36px), `--sp-control-height` (40px) and `--sp-control-height-lg` (48px) now decide how tall a control is, rather than its padding and its label's font size deciding between them. A medium Button, a Select trigger and a Pagination item are all 40px, so a row of them lines up. Sizes change: Button md 43→40, sm 36 (unchanged in effect, now declared), lg 51→48, icon-only 46→40, micro 28, Tabs trigger 47→48.

**Spacing names a step.** Every gap, margin and inset references `--spacing-xs` … `--spacing-2xl`, and each of those is a multiple of `--sp-grid-base-size` — so setting that one token retunes the library's rhythm instead of one component's. 81 raw lengths became tokens; Card's inset moves 12→16px, Message's 12/20→16/24px, and the Select and DropdownMenu rows gain a full unit of padding with a half-step between them.

**Type is in rem.** Every `font-size` and `line-height` in the library, and the `--sp-font-*` scale, are rem rather than px, so text follows a reader who has set their browser's text larger. Sizes are still written in px in the source and converted (`rem(14)` → `0.875rem`), so the numbers stay readable. Spacing deliberately stays in px: the grid is measured against the viewport, and gaps that grew with the text would pull layouts apart.

Consumers who pinned a layout to a control's exact height, or who set `--spacing-*` to their own values, should check those: the first changed, and the second are now derived from the grid unit.
