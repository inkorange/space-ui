---
"@inkorange/space-ui": minor
---

New `Autocomplete`: a text field that offers matching rows as you type.

```tsx
<Autocomplete
  value={query}
  onValueChange={setQuery}
  onSelect={(slug) => router.push(`/exoplanets/${slug}`)}
  icon={<MagnifyingGlassIcon width={16} height={16} />}
  options={matches.map((m) => ({ value: m.slug, label: m.name, meta: m.type }))}
  emptyMessage="Nothing matching that."
  footer="Showing 50 of 2,700 — keep typing to narrow it down."
/>
```

It never fetches and never ranks. You hand it the candidate rows, in the order
your domain considers best, and it narrows them against what has been typed —
keeping your order — then owns the parts every autocomplete needs and nobody
enjoys writing twice: the popover, the keyboard model and the aria wiring.

`caseSensitive` makes the match exact, so `trappist` no longer finds
`TRAPPIST`. `preFiltered` skips the match altogether, for rows a server or a
fuzzy search already chose — without it, a plain substring test here would
silently drop rows a smarter match upstream had found. Both are ordinary
booleans defaulting to false, so `<Autocomplete caseSensitive />` is enough.

When `label` is markup rather than a string, give the option a `search` string
to match against; it falls back to `value`, which is usually a slug and rarely
what anyone is typing.

Arrows move the highlight and skip disabled rows, Home and End jump to the
ends, Enter selects, Escape and Tab close, and an outside pointerdown
dismisses. Hovering moves the same highlight the keyboard uses, so a mouse
highlight and a keyboard highlight can never disagree about what Enter would
do. The list is a popover rather than a block in the flow, because results
that appear mid-keystroke and push the page down under the cursor are
disorienting.

Send no options, no `loading` and no `emptyMessage` and no panel appears at
all — which is how you keep it shut below a minimum query length without
managing open state yourself.
