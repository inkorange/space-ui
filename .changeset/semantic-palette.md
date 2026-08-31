---
"@inkorange/space-ui": major
---

Rename the accent palette from hues to semantic roles.

Colours are now named for what they do, never for what they look like — the
treatment the grays already had. Accents run on two axes:

- **Emphasis** — `--sp-primary-*` (was `--sp-blue-*`)
- **Status** — `--sp-success-*` (green), `--sp-warning-*` (amber),
  `--sp-danger-*` (red), `--sp-accent-*` (violet)

A single primary/secondary/tertiary ranking was considered and rejected: it
would have made `secondary` mean "success" and `tertiary` mean "destructive",
which says less than the hue names did. Emphasis and status are different
questions and need different words.

Component props follow: `<Text color="muted|danger|success|warning">`,
`<Heading color="muted|danger">`, `<DropdownMenu.Item color="danger">`, and
`<Badge>` gains a documented split — semantic roles (muted, primary, success,
warning, danger) alongside categorical hues (cyan, purple, orange, yellow,
accent) for telling data apart, where the hue is the identity and a ranking
word would imply an order that does not exist.

`--sp-yellow-9` and `--sp-orange-9` are removed: both were defined and
referenced by nothing.

**Migration:** rename token references and prop values per the mapping above.
Badge's categorical colours are unchanged.
