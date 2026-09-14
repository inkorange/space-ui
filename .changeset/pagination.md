---
"@inkorange/space-ui": minor
---

New `Pagination`.

```tsx
<Pagination
  pagination={{ page, pageSize: 120, totalItems: 2091 }}
  onPageClick={(page) => fetchPage(page)}
/>
```

Give it the pagination object your API returns — page, page size and total
items — and it reports the clicked page through `onPageClick`. It holds no
state, has no framework dependency, and renders nothing for a single page.

It shows the first page, the last, and `siblings` either side of the current
one (default 1), with an ellipsis only where it would hide two or more pages —
hiding one page behind "…" costs the same room as just showing it.

The control holds the same width on every page. The window always has the same
number of slots, and a gap is exactly as wide as a page number, so the row
never shifts under the cursor and the next click lands where the last one did.
Previous and Next stay in place when they cannot be used, for the same reason.

Every control wears the same limb-lit glass as Select and Button, but only the
current page's rim orbits — nine arcs turning in one row would be noise. The
current page is lit at the rim and from within while the other numbers step
back, so it reads as where you are rather than as a brighter peer. `animated={false}` stills the orbit; the skin
stays.

`pageCount` and `pageWindow` are exported for anyone rendering their own
markup.

The gallery's API tables now document the data objects a component needs, not
just its props. A props table could only show that `pagination` is a
`PaginationState` — not what goes in one. Any exported interface a prop's type
names now gets a table of its own beside that component, which also documents
`AutocompleteOption` and `IconToggleOption` for the first time.
