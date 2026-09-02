---
"@inkorange/space-ui": minor
---

New `Message` component, and a Feedback category to put it in.

```tsx
<Message variant="warning" title="Thin atmosphere">
  Surface pressure is below 0.3 bar.
</Message>
```

Three variants that do not merely change hue. `info` is lit like the rest of
the system; `warning` warms its rim to amber; `alert` takes the ember
treatment the destructive Button wears. Each carries its own glyph, so the
kind of message reads before the words do, and the variant lives on a lit
leading edge rather than a full coloured border — unmistakable without the
whole panel shouting.

`alert` announces itself with `role="alert"`, which interrupts a screen
reader. That is right for something already wrong and wrong for everything
else, so `info` and `warning` are polite status regions that wait their turn.

For a decision the reader has to make, reach for `AlertDialog` — a message
states, it does not ask.

Three icons come with it, ported from the same MIT source as the rest:
`InfoCircledIcon`, `ExclamationTriangleIcon`, `CrossCircledIcon`.

`Loader` and `Progress` move out of the Buttons category, which neither of
them ever was — they report on work rather than start it. Their documentation
pages move with them, so any bookmark to `components--buttons--loader` is now
`components--feedback--loader`. No API change.
