---
"@inkorange/space-ui": patch
---

Fix `Carousel` showing one dot too many, and leaving the second-to-last dot lit at the end.

When a slide's content was wider than its column — a card with an image, most often — the row could scroll a little past the position scroll snapping lets it rest at. That extra room counted as a stopping point, so the dots gained a final one nobody could reach and arriving at the end still lit the dot before it. The last stop is now the position the last slide actually snaps to, and the same position decides when the Next arrow turns off.

The stopping points are also rechecked when the row's scrollable width changes without the carousel itself resizing, which happens when an image or web font arrives after the first measurement.
