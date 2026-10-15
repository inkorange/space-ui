---
"@inkorange/space-ui": minor
---

Describe the library to machines, and to anyone whose browser is not running the gallery.

Every component's JSDoc is now published three times over — into the shipped
`.d.ts` files, the gallery's prop tables, and a generated `llms.txt`,
`llms-full.txt` and `reference.html` on the docs site. That made doc comments
public copy, which turned up two problems: seven components, Select and Dialog
among them, shipped with no description at all, and several descriptions named
the application this library was extracted from or the component library it
replaced. Both are fixed, and `published-docs.test.ts` now fails CI if either
comes back.

`dist/index.d.ts` gains package documentation, so the first file a type-aware
editor or agent opens explains the rules that the type signatures cannot: one
stylesheet import, tokens rather than lengths, booleans defaulting to false,
selection through `onValueChange`, and ARIA already inside the components.
`AGENTS.md` ships in the package alongside the README.
