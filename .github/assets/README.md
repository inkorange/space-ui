# README imagery

Images referenced by the repo README, which npm also renders.

## Naming

| File | What it should show |
| --- | --- |
| `components.svg` | Hand-authored component sampler. Colours come from `tokens.css` — update it if the palette changes. |
| `doc-screen.jpg` | The documentation site: sidebar plus a component page, so the shape of the docs is obvious at a glance. |
| `tokens.jpg` | *(optional)* Foundations → Color, showing the token tables. |
| `api.jpg` | *(optional)* A generated API table with props, defaults and descriptions. |

## Capturing

- **2x (retina)**, then let the README scale it to `width="100%"`. A 1x capture
  looks soft on the displays most people read GitHub on.
- **Keep the browser chrome out.** The frame dates the image and adds nothing.
- **Under ~500KB each.** These live in git forever; `pngquant` or `oxipng`
  will usually take a screenshot down by 60-70% with no visible loss.
- **Dark surroundings.** A light browser background around a dark UI reads as
  a mistake.

## Referencing

Absolute URLs only:

```
https://raw.githubusercontent.com/inkorange/space-ui/main/.github/assets/<file>
```

npm renders the README from the registry, where a relative path resolves
against npmjs.com and 404s. The URL points at `main`, so an image is broken in
a pull request until it merges — that is expected, not a mistake.
