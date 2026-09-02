# SpaceUI: Dark interfaces with their own light source

<!-- badges:start -->

[![npm](https://img.shields.io/npm/v/@inkorange/space-ui)](https://www.npmjs.com/package/@inkorange/space-ui)
![coverage](https://img.shields.io/badge/coverage-82%25-green)
![minzip](https://img.shields.io/badge/minzip-21.7%20kB-blue)
![dependencies](https://img.shields.io/badge/dependencies-0-blue)
[![docs](https://img.shields.io/badge/docs-live%20gallery-0b7dd6)](https://space-components.vercel.app)

<!-- badges:end -->

Lit glass. An orbiting rim. Faint starlight across a surface. Not a theme you
configure — the way these components look out of the box, with nothing to
compose and nothing to opt into.

<!-- Absolute URLs on purpose: npm renders this file too, and relative paths
     resolve against the registry rather than the repository. This sheet is a
     screenshot of the real components, shot from the gallery — see
     `pnpm assets`. -->
<img alt="Stickersheet: Button, Badge, Select, TextField, Slider, Progress, IconToggle, RadioGroup, Loader, Tabs, icons, Text, TextArea and Card — plain and with an image — on a dark ground"
     src="https://raw.githubusercontent.com/inkorange/space-ui/main/.github/assets/components.jpg"
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
<Button>Build planet</Button>                  
{/* rim orbits, stars twinkle */}
<Button animated={false}>Build planet</Button>
{/* same glass, held still */}
```

Readers who ask for reduced motion get the stilled treatment automatically,
whatever the prop says.

## Built for dense, dark UI

Forms, overlays and controls that hold up when there are a lot of them on
screen at once — the kind of interface where someone is adjusting values and
watching something respond.

```tsx
<Select value={star} onValueChange={setStar}>
  {types.map((t) => (
    <Select.Item key={t} value={t}>{t}-type star</Select.Item>
  ))}
</Select>
```

The small things are handled so you never have to notice them. That Select
sizes itself to its widest option, so it does not change width as you choose.
Dialogs ride the browser's own top layer, so focus trapping and Escape are the
platform's job rather than a library's approximation. Tabs connect to the panel
beneath them.

## Make it yours — it's all CSS variables

No component holds a value of its own. Every colour, size and duration in the
library resolves through a **CSS custom property** in the `--sp-` namespace,
and the defaults ship inside `styles.css` — so retheming is a block of
variables you write, never a fork, a config file, or a build step.

There are three tiers, from broadest to narrowest.

**Palette roles.** Named for the job the colour does, never the hue. Change one
and every component playing that role moves with it:

```css
:root {
  --sp-primary-solid: #7c5cff;   /* solid accent fill: badges, progress */
  --sp-primary-text:  #b9a6ff;   /* accent text and links               */
  --sp-gray-panel:    #14161c;   /* card and panel fills                */
  --sp-gray-border:   #d6ebfd30; /* hairlines and control borders       */
  --sp-danger-text:   #ff9592;   /* destructive, not "red"              */
}
```

**Surface channels.** The lit glass is built from layered translucency, so
those variables carry colour *channels* and let each layer pick its own alpha:

```css
:root {
  --sp-rim-rgb:   190 160 255;   /* the lit atmosphere limb    */
  --sp-glow-rgb:  150 130 255;   /* hover and focus bloom      */
  --sp-glass-rgb:  18 14 34;     /* the glass fill itself      */
}
```

Inside the components these read as `rgb(var(--sp-rim-rgb) / 0.4)`, so give
them space-separated channels — a `#hex` or a full `rgb(...)` leaves the alpha
with nothing to work on.

**Component properties.** Where one component needs a dial of its own it
exposes one, always named `--sp-[component]-[modifier]-[type]`:

```css
--sp-progress-height: 12px;
--sp-select-trigger-max-width: 24rem;
--sp-loader-moon-size: 10px;
```

Every component page in the gallery lists its own in a **Custom properties**
table, saying what each one changes.

Because these are ordinary CSS variables, they cascade. Declare them on `:root`
to theme the application, or on any element to retheme just that subtree —
a warmer palette inside one panel, a tighter control in one toolbar:

```css
.launch-panel {
  --sp-glass-rgb: 30 16 14;
  --sp-rim-rgb: 255 180 130;
  --sp-control-height: 32px;
}
```

You override only what you name, and everything you leave alone keeps its
shipped value. Supply no variables at all and the library still renders exactly
as it does in the gallery.

## The components

Every one of these has a live page in the gallery — the component running, the
source behind it, its full prop table with defaults, and the custom properties
it exposes.

| | |
| --- | --- |
| **Typography** | [Text](https://space-components.vercel.app/?story=components--typography--text-sizes) · [Link](https://space-components.vercel.app/?story=components--typography--text-sizes) · [Heading](https://space-components.vercel.app/?story=components--typography--headings) · [Badge](https://space-components.vercel.app/?story=components--typography--badges) · [Separator](https://space-components.vercel.app/?story=components--typography--separator) |
| **Layout** | [Card](https://space-components.vercel.app/?story=components--layout--card) · [Flex](https://space-components.vercel.app/?story=components--layout--flex-and-grid) · [Grid](https://space-components.vercel.app/?story=components--layout--flex-and-grid) · [Box](https://space-components.vercel.app/?story=components--layout--flex-and-grid) |
| **Forms** | [TextField](https://space-components.vercel.app/?story=components--forms--text-field) · [TextArea](https://space-components.vercel.app/?story=components--forms--text-area) · [Select](https://space-components.vercel.app/?story=components--forms--select) · [Slider](https://space-components.vercel.app/?story=components--forms--slider) · [RadioGroup](https://space-components.vercel.app/?story=components--forms--radio-group) |
| **Buttons** | [Button](https://space-components.vercel.app/?story=components--buttons--buttons) · [IconToggle](https://space-components.vercel.app/?story=components--buttons--icon-toggle) |
| **Feedback** | [Loader](https://space-components.vercel.app/?story=components--buttons--loader) · [Progress](https://space-components.vercel.app/?story=components--buttons--progress) |
| **Overlays** | [Dialog](https://space-components.vercel.app/?story=components--overlays--dialog) · [AlertDialog](https://space-components.vercel.app/?story=components--overlays--alert-dialog) · [DropdownMenu](https://space-components.vercel.app/?story=components--overlays--dropdown-menu) · [Tabs](https://space-components.vercel.app/?story=components--overlays--tabs) · [Tooltip](https://space-components.vercel.app/?story=components--overlays--tooltip) |
| **Icons** | [20 icons](https://space-components.vercel.app/?story=components--icons--all-icons) |
| **Foundations** | [Color](https://space-components.vercel.app/?story=foundations--color) · [Spacing](https://space-components.vercel.app/?story=foundations--spacing) · [Type scale](https://space-components.vercel.app/?story=foundations--type-scale) · [Motion](https://space-components.vercel.app/?story=foundations--motion) · [Token usage](https://space-components.vercel.app/?story=foundations--token-usage) |

<a href="https://space-components.vercel.app">
  <img alt="The SpaceUI documentation gallery: components, their props, tokens and source"
       src="https://raw.githubusercontent.com/inkorange/space-ui/main/.github/assets/doc-screen.jpg"
       width="100%">
</a>

Start at **[space-components.vercel.app](https://space-components.vercel.app)** — the
introduction covers the token system and how to theme it, and every component
page shows the code you would actually write.

## What you get

**Zero runtime dependencies**, and about 22 kB over the wire gzipped — a 16 kB
ESM bundle and a 7 kB stylesheet. React 19, precompiled CSS, no build tooling
required downstream. Both numbers are measured from the build on every CI run,
so the badges above cannot drift.

These ran in production before they became a package, so they arrived with
their edge cases already found rather than imagined.

**Requires** React 19 and a dark surface. There is deliberately no light theme;
these components assume the dark they were drawn for.

## License

MIT
