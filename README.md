# SpaceUI

**Components for dark, instrument-dense interfaces.**

Lit glass. An orbiting rim. Faint starlight across a surface. Not a theme you
configure — the way these components look out of the box, with nothing to
compose and nothing to opt into.

<!-- Absolute URLs on purpose: npm renders this file too, and relative paths
     resolve against the registry rather than the repository. -->
<img alt="A lit-glass button, select, badges, slider, progress bar and folder tabs on a dark ground"
     src="https://raw.githubusercontent.com/inkorange/space-ui/main/.github/assets/components.svg"
     width="100%">

```bash
pnpm add @inkorange/space-ui
```

```tsx
import "@inkorange/space-ui/styles.css";
import { Card, Heading, Text, Badge, Button } from "@inkorange/space-ui";

export function Planet() {
  return (
    <Card>
      <Heading size="5">Kepler-442b</Heading>
      <Badge color="success">Temperate</Badge>
      <Text size="2" color="muted">
        A super-earth in the habitable zone, 1,206 light years out.
      </Text>
      <Button>Build planet</Button>
    </Card>
  );
}
```

That is the whole setup. Every component arrives already wearing the design.

## The design language is the component

Most systems hand you primitives and a theme to paint them with. This one does
not separate the two. A `Button` is a lit-glass capsule whose rim catches light
like a planet's atmosphere; a `Slider` is a glass tube with a limb-lit moon you
drag along it. There is no plain mode, because a plain mode would be a
different library.

What you *can* control is movement. Ambient motion suits a hero button and
distracts in a dense form, so one prop stills it — the look untouched, only the
loops stopped:

```tsx
<Button>Build planet</Button>                  {/* rim orbits, stars twinkle */}
<Button animated={false}>Build planet</Button> {/* same glass, held still */}
```

Readers who ask for reduced motion get the stilled treatment automatically,
whatever the prop says.

## Built for dense, dark UI

Forms, overlays and controls that hold up when there are a lot of them on
screen at once — the kind of interface where someone is adjusting values and
watching something respond.

```tsx
<Select.Root value={star} onValueChange={setStar}>
  <Select.Trigger />
  <Select.Content>
    {types.map((t) => (
      <Select.Item key={t} value={t}>{t}-type star</Select.Item>
    ))}
  </Select.Content>
</Select.Root>
```

The small things are handled so you never have to notice them. That Select
sizes itself to its widest option, so it does not change width as you choose.
Dialogs ride the browser's own top layer, so focus trapping and Escape are the
platform's job rather than a library's approximation. Tabs connect to the panel
beneath them.

## Make it yours

Every component reads the same named roles and nothing else, so a whole theme
is one block of overrides — and anything you leave alone keeps the shipped
default:

```css
:root {
  --sp-primary-solid: #7c5cff;
  --sp-gray-panel: #14161c;
  --sp-rim-rgb: 190 160 255;   /* the glass rim, as channels */
  --sp-font-family: "Inter", system-ui, sans-serif;
}
```

Colours are named for the job they do, never the hue — `success`, `danger`,
`muted` — so a review can tell when one is wrong.

## See it running

Every component, its props, its tokens, and the source behind each example.

<a href="https://space-components.vercel.app">
  <img alt="The SpaceUI documentation gallery: components, their props, tokens and source"
       src="https://raw.githubusercontent.com/inkorange/space-ui/main/.github/assets/doc-screen.jpg"
       width="100%">
</a>

📖 **[space-components.vercel.app →](https://space-components.vercel.app)**

## What you get

**24 components** — typography, layout, forms, overlays, buttons — plus 20
icons, with **zero runtime dependencies**. React 19, precompiled CSS, no build
tooling required downstream.

These ran in production before they became a package, so they arrived with
their edge cases already found rather than imagined.

**Requires** React 19 and a dark surface. There is deliberately no light theme;
these components assume the dark they were drawn for.

## License

MIT
