---
"@inkorange/space-ui": minor
---

`Card` takes an optional `image`.

```tsx
<Card image={<img src={url} alt={name} />}>
  <Heading size="4">Kepler-442b</Heading>
</Card>
```

The card frames it: full-bleed to its edges, top corners matched to its own
radius, cropped to fill. It is a prop rather than an ordinary child because
the card reserves the box **before** the image loads — `--sp-card-image-ratio`,
default `16 / 10` — so a row of cards agrees on a shape up front and none of
them reflow as thumbnails arrive. A child could not be sized by the card.

Pass whatever your framework renders — a plain `<img>`, a `next/image`, a
`<video>`, or a placeholder standing in for one that failed. Nothing about the
slot is framework-specific.
