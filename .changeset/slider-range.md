---
"@inkorange/space-ui": minor
---

`Slider` takes a second thumb, and `step` is now optional.

Pass two numbers instead of one and it becomes a range: `value={[20, 80]}`, reported back as `[start, end]`. The array API was always there for this, so nothing changes for a slider with one thumb.

The two thumbs cannot cross — each is clamped to the other, so index 0 stays the lower one and a range can never read back inverted. `minDistance` keeps a gap between them for a range where a zero-width span would mean nothing. A press on the track moves whichever thumb is nearer and hands it the keyboard, and when both thumbs sit on the same value the one that can still travel is raised, so a range collapsed at either end can always be opened again. Each thumb is a real `<input type="range">`, so the arrow keys, Home, End and Page Up/Down keep working, and each announces itself — "Mass minimum" and "Mass maximum" by default, or whatever `thumbLabels` says.

`step` now defaults to 1 rather than being required, and it is the grid every value lands on for both variants: dragged, pressed or walked with the keyboard. A clamped thumb stays on that grid too — with `step={10}` and `minDistance={25}`, a thumb stopping against its neighbour used to land on 75, a value the slider could not otherwise produce; it now settles on the next step that still honours the gap.
