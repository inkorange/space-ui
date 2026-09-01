# README imagery

Images referenced by the repo README, which npm also renders.

## Naming

| File | What it should show |
| --- | --- |
| `components.jpg` | Component stickersheet, from the Overview → Stickersheet story. |
| `doc-screen.jpg` | The documentation site: sidebar plus the landing page, so the shape of the docs is obvious at a glance. |
| `tokens.jpg` | *(optional)* Foundations → Color, showing the token tables. |
| `api.jpg` | *(optional)* A generated API table with props, defaults and descriptions. |

Both are **generated, not drawn**. Run the gallery, then shoot them:

```bash
pnpm docs      # one terminal
pnpm assets    # another
```

Never edit either by hand — change the gallery and re-shoot, so the images
cannot claim something the site does not. Re-shoot after any change to the
landing-page copy, the sidebar, or a component's appearance.

## Capturing

The script already does all of this; the reasoning is here so nobody
"optimises" it back.

- **1.5x, not 1x.** A 1x capture looks soft on the displays most people read
  GitHub on. 2x costs roughly double for no visible gain at the width GitHub
  renders these.
- **JPEG q92 at 4:4:4 chroma.** The default 4:2:0 halves colour resolution and
  smears the ember rim and the coloured badges — the things being judged here.
  PNG is ~2x the bytes for no visible gain; 256-colour PNG is smaller still
  but visibly bands the slider gradient.
- **Under ~500KB each.** These live in git forever.
- **No browser chrome.** The frame dates the image and adds nothing.

## Referencing

Absolute URLs only:

```
https://raw.githubusercontent.com/inkorange/space-ui/main/.github/assets/<file>
```

npm renders the README from the registry, where a relative path resolves
against npmjs.com and 404s. The URL points at `main`, so an image is broken in
a pull request until it merges — that is expected, not a mistake.
