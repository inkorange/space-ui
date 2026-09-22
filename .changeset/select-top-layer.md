---
"@inkorange/space-ui": patch
---

Fix `Select`'s panel being trapped inside a Dialog, or any ancestor that clips or contains it.

The panel was absolutely positioned inside the Select, so a container with `overflow: hidden`, a transform, or its own stacking context — a Dialog most visibly — clipped it or scrolled it away. No z-index could help, because the panel was never free of the ancestor.

It now rides the browser's popover layer, the same one Popover and DropdownMenu use, so it renders above everything on the page while staying where it is in the DOM: no portal, so event paths, focus order and outside-press handling are unchanged. It follows its trigger while open, flips above when there is not enough room below, and stays within the viewport's edges.
