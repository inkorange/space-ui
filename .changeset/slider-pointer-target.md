---
"@inkorange/space-ui": minor
---

Fix the Slider's handles not taking a press, and dragging one step before stopping.

Both thumbs were `<input type="range">` elements covering the whole track, one
over the other, and the browser decided which of them a press belonged to
before any of this code ran — so the answer came down to DOM order. Whenever
the two thumbs were within a thumb's width of each other on screen, a press on
the lower one was handed to the upper one, whose clamp then refused to travel
that way: the handle snapped a step and stopped. Over a wide range this was
constant rather than occasional, because a few units of a 0–10,000 range are a
fraction of a pixel apart. With the two thumbs on exactly the same value, the
lower one could not be grabbed at all.

The component now owns pointer interaction. A press anywhere on the control is
measured against where the thumbs are actually drawn, the nearest one is
dragged until the pointer is released, and the inputs take no pointer events —
they keep focus, the arrow keys, Home, End, Page Up/Down and the slider role.
A press on a handle takes hold of it where it stands instead of jogging the
value first; a press on two stacked handles is answered by the direction the
drag then travels. A thumb sitting at the maximum can be grabbed by the half
of it that hangs past the end of the track, and a drag that runs off the track
or releases elsewhere still ends cleanly.
