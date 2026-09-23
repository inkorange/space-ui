---
"@inkorange/space-ui": patch
---

Fix `Carousel`'s arrows and dots not keeping up when a breakpoint changes `--sp-carousel-view-count`.

The row re-measured when its own box changed size, which covers a container resizing but not a stylesheet re-dividing the row: setting the view count changes how wide each slide is while leaving the row exactly as wide as it was. The arrows, dots and page size then went on describing the old count until something else moved. It now watches a slide as well as the row.

Found by a browser test, which is the only place it could be: the bug is invisible without layout.
