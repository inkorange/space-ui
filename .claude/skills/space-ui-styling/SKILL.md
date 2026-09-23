---
name: space-ui-styling
description: Use when writing or changing any stylesheet in packages/space-ui — a new component's .module.scss, a token in tokens.css, or a spacing, size or colour value in an existing one. Covers the spacing scale, the rem type helper, the control height ladder, and the tokens that must carry every colour.
---

# Styling a SpaceUI component

The library's look is built from tokens, and the rules below are enforced by
tests (`src/components/grid.test.ts`, `tokens.test.ts`). Breaking one fails
CI, so follow it while writing rather than fixing it afterwards.

## Spacing: name a step

```scss
gap: var(--spacing-sm);          /* yes */
padding: var(--spacing-md);      /* yes */
gap: 8px;                        /* no — a raw length */
padding: 10px;                   /* no — and off the grid entirely */
```

| Token | At the default unit | Use it for |
|---|---|---|
| `--spacing-xs` | 4px | inside small, dense parts: a chip, a menu row, a gap between a bar and its figure |
| `--spacing-sm` | 8px | the default gap between neighbouring things |
| `--spacing-md` | 16px | a panel's inset, the gap between groups |
| `--spacing-lg` | 24px | a section's inset |
| `--spacing-xl` | 32px | space between sections |
| `--spacing-2xl` | 40px | the widest step the library uses |

Every step is a multiple of `--sp-grid-base-size`, so setting that one token
retunes the whole library. A value that is not on the scale means the design
is off the grid — take it to the nearest step rather than writing the px.

## Type: `rem()`, written in px

```scss
@use "../styles/type" as *;

.label {
  font-size: rem(14);    /* → 0.875rem */
  line-height: rem(20);
}
```

A px size ignores a reader who has set their browser's text larger. The
helper keeps the source readable — `rem(14)` says what it is, `0.875rem`
does not. Spacing stays in px: the grid is a layout rhythm measured against
the viewport, and gaps that grew with the text would pull layouts apart.

## Control heights: use the ladder

```scss
min-height: var(--sp-control-height);      /* 40px — the default */
min-height: var(--sp-control-height-sm);   /* 36px */
min-height: var(--sp-control-height-lg);   /* 48px */
```

Never let padding decide a control's height: a button and the Select beside
it must line up, and they cannot if their heights come from their labels.

## Colour: always a token

No hex, `rgb()` or `hsl()` literal belongs in a component stylesheet. Add
`--sp-[component]-[modifier]-[type]` to `tokens.css`, document it with an
`@token` line in the SCSS (the gallery reads those into its Custom
properties table), and reference it. Translucent layers use the `-rgb`
channel tokens: `rgb(var(--sp-rim-rgb) / 0.35)`.

## The only exceptions

Hairlines and optical nudges — a 1px mask inset, a 2px lift to centre an
indicator on the first line of its label. They are not spacing. Each one goes
in the `EXCEPTIONS` map in `grid.test.ts`, keyed by file and value, with the
reason written out. An exception that outlives the value it excused also
fails the test, so the map cannot rot.
