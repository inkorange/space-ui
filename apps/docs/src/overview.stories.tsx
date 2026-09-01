import { useState, type CSSProperties } from "react";
import {
  Badge,
  Card,
  Heading,
  Select,
  Separator,
  Button,
  Text,
} from "@inkorange/space-ui";
import { Code } from "./docs-code";
import { Reveal, Starfield } from "./docs-motion";
import {
  componentCount,
  iconCount,
  minzipKb,
  packageName,
  repoUrl,
} from "./system-facts";

export default {
  title: "Overview",
  meta: { fullBleed: true },
};

/**
 * A real composition rather than an invented device, built from the
 * components that carry most of the load in practice — Text, Button,
 * Heading, Badge, Card — plus a Select, with nothing composed on top. The lit
 * glass is what the package gives you, so this is what a consumer would ship.
 */
const PlanetCard = () => {
  const [star, setStar] = useState("G");

  return (
    <Card style={{ padding: 20 }}>
      <div className="docs-demo__head">
        <Heading size="5">Kepler-442b</Heading>
        <Badge color="success">Temperate</Badge>
      </div>

      <Text size="2" color="muted">
        A super-earth in the habitable zone, 1,206 light years out.
      </Text>

      <Separator style={{ margin: "16px 0" }} />

      <dl className="docs-demo__stats">
        <div>
          <dt>Mass</dt>
          <dd>1.34 M⊕</dd>
        </div>
        <div>
          <dt>Radius</dt>
          <dd>1.11 R⊕</dd>
        </div>
        <div>
          <dt>Period</dt>
          <dd>112.3 d</dd>
        </div>
      </dl>

      <div className="docs-demo__field">
        <Text size="1" color="muted">
          Host star
        </Text>
        <Select value={star} onValueChange={setStar}>
          {STAR_TYPES.map((t) => (
            <Select.Item key={t} value={t}>
              {t}-type star
            </Select.Item>
          ))}
        </Select>
      </div>

      <div className="docs-demo__actions">
        <Button>Build planet</Button>
        <Button size="sm">View system</Button>
      </div>
    </Card>
  );
};

/**
 * The rendered panel and the CSS listing below it are generated from ONE
 * array, so the code a visitor copies is literally the code that produced
 * what they are looking at. A hand-written listing beside a hand-written
 * demo drifts the first time either one is touched.
 */
const DEMO_RULES: Array<[string, string]> = [
  ["padding", "var(--spacing-md)"],
  ["background", "var(--sp-gray-panel)"],
  ["border", "1px solid var(--sp-gray-border)"],
  ["border-radius", "8px"],
  ["color", "var(--sp-gray-text)"],
  ["font-size", "var(--sp-font-sm)"],
];

const demoStyle = Object.fromEntries(
  DEMO_RULES.map(([prop, value]) => [
    prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()),
    value,
  ]),
) as CSSProperties;

const TokenExample = () => (
  <div className="docs-tokendemo">
    <div className="docs-tokendemo__pane">
      <div className="docs-tokendemo__label">Renders as</div>
      <div style={demoStyle}>
        <div
          style={{
            color: "var(--sp-gray-muted)",
            fontSize: "var(--sp-font-xs)",
            letterSpacing: "0.08em",
          }}
        >
          SURFACE TEMPERATURE
        </div>
        <div
          style={{
            fontSize: "var(--sp-font-xl)",
            marginTop: "var(--spacing-xs)",
          }}
        >
          288 K
        </div>
      </div>
    </div>

    <Code
      label="readout.css"
      language="css"
      code={`.readout {\n${DEMO_RULES.map(([prop, value]) => `  ${prop}: ${value};`).join("\n")}\n}`}
    />
  </div>
);

const STAR_TYPES = ["O", "B", "A", "F", "G", "K", "M"];

/**
 * The same two components, motion running and motion stilled. The skin is
 * NOT what differs here — it never is, it is the component. Only the ambient
 * loops stop, which is what `animated={false}` exists for.
 */
const MotionDemo = () => {
  const [liveStar, setLiveStar] = useState("G");
  const [stillStar, setStillStar] = useState("G");

  return (
    <div className="docs-skindemo">
      <section className="docs-skindemo__pane docs-skindemo__pane--lit">
        <header className="docs-skindemo__head">
          <span className="docs-skindemo__badge docs-skindemo__badge--lit">
            Motion on
          </span>
          <span className="docs-skindemo__note">default</span>
        </header>
        <div className="docs-skindemo__stack">
          <Button>Build planet</Button>
          <Select value={liveStar} onValueChange={setLiveStar}>
            {STAR_TYPES.map((t) => (
              <Select.Item key={t} value={t}>
                {t}-type star
              </Select.Item>
            ))}
          </Select>
        </div>
        <pre className="docs-skindemo__code">&lt;Button /&gt;</pre>
      </section>

      <section className="docs-skindemo__pane">
        <header className="docs-skindemo__head">
          <span className="docs-skindemo__badge">Motion stilled</span>
          <span className="docs-skindemo__note">animated={"{false}"}</span>
        </header>
        <div className="docs-skindemo__stack">
          <Button animated={false}>Build planet</Button>
          <Select value={stillStar} onValueChange={setStillStar} animated={false}>
            {STAR_TYPES.map((t) => (
              <Select.Item key={t} value={t}>
                {t}-type star
              </Select.Item>
            ))}
          </Select>
        </div>
        <pre className="docs-skindemo__code">
          &lt;Button animated={"{false}"} /&gt;
        </pre>
      </section>
    </div>
  );
};

/** Every component, grouped the way the sidebar groups them, each pointing at
 *  the page that documents it. Kept here rather than derived from the story
 *  list because the grouping is editorial: Loader and Progress live under
 *  Buttons in the tree, but a reader looking for them is thinking "feedback". */
const CATALOGUE: Array<[string, Array<[string, string]>]> = [
  ["Typography", [
    ["Text", "components--typography--text-sizes"],
    ["Heading", "components--typography--headings"],
    ["Link", "components--typography--text-sizes"],
    ["Badge", "components--typography--badges"],
    ["Separator", "components--typography--separator"],
  ]],
  ["Layout", [
    ["Card", "components--layout--card"],
    ["Flex", "components--layout--flex-and-grid"],
    ["Grid", "components--layout--flex-and-grid"],
    ["Box", "components--layout--flex-and-grid"],
    ["ScrollArea", "components--layout--scroll-area"],
  ]],
  ["Forms", [
    ["TextField", "components--forms--text-field"],
    ["TextArea", "components--forms--text-area"],
    ["Select", "components--forms--select"],
    ["Slider", "components--forms--slider"],
    ["RadioGroup", "components--forms--radio-group"],
  ]],
  ["Buttons", [
    ["Button", "components--buttons--buttons"],
    ["IconToggle", "components--buttons--icon-toggle"],
  ]],
  ["Feedback", [
    ["Loader", "components--buttons--loader"],
    ["Progress", "components--buttons--progress"],
  ]],
  ["Overlays", [
    ["Dialog", "components--overlays--dialog"],
    ["AlertDialog", "components--overlays--alert-dialog"],
    ["DropdownMenu", "components--overlays--dropdown-menu"],
    ["Tabs", "components--overlays--tabs"],
    ["Tooltip", "components--overlays--tooltip"],
  ]],
];

const TOKEN_TIERS = [
  {
    reach: "every component",
    name: "Palette roles",
    body: "Named for the job the colour does, never the hue. Change one and every component playing that role moves with it.",
    sample: "--sp-primary-solid",
  },
  {
    reach: "every glass surface",
    name: "Surface channels",
    body: "The lit glass is layered translucency, so these carry colour channels and let each layer pick its own alpha. Give them bare channels, not a hex — the alpha maths needs something to work on.",
    sample: "--sp-rim-rgb: 150 190 255",
  },
  {
    reach: "one component",
    name: "Component properties",
    body: "Where a single component needs a dial of its own, it exposes one and nothing else reads it.",
    sample: "--sp-progress-height",
  },
];

const PRINCIPLES = [
  {
    name: "Eight-point spacing",
    body: "Every gap, inset, and offset lands on the grid. Off-grid values round up to the next step rather than down, so density never creeps in by accident.",
    rule: "12px → 16px",
  },
  {
    name: "Seven gray roles",
    body: "Grays are named for the job they do, not the step they sit on. Seven roles instead of fifteen numbered steps, which is why a theme change is a seven-line diff.",
    rule: "--sp-gray-text-dim",
  },
  {
    name: "No framework in the surface",
    body: "No framework in the public surface, no runtime dependencies, no framework-specific props. A test fails the build if that boundary is crossed, so it holds over time.",
    rule: "radixImports.test.ts",
  },
  {
    name: "CSS arrives precompiled",
    body: "Consumers import one stylesheet. The library is authored in Sass, but nothing downstream needs a Sass toolchain to use it.",
    rule: 'import "@inkorange/space-ui/styles.css"',
  },
];

export const Introduction = () => (
  <div className="docs-page">
    <section className="docs-hero">
      <Starfield />

      <div className="docs-hero__grid">
        <div className="docs-hero__copy">
          <div
            className="docs-hero__eyebrow docs-rise"
            style={{ animationDelay: "40ms" }}
          >
            SpaceUI · design system
          </div>

          <h1
            className="docs-hero__title docs-rise"
            style={{ animationDelay: "120ms" }}
          >
            Dark interfaces with their own <em>light source</em>.
          </h1>

          <p
            className="docs-hero__lede docs-rise"
            style={{ animationDelay: "220ms" }}
          >
            {componentCount} React components and {iconCount} icons on a
            seven-role token system, with zero runtime dependencies. Lit glass,
            an orbiting rim, faint starlight — the design arrives with the
            component, not after it.
          </p>

          <div
            className="docs-hero__actions docs-rise"
            style={{ animationDelay: "320ms" }}
          >
            <a className="docs-cta" href="?story=components--buttons--buttons">
              Browse components
            </a>
            <a
              className="docs-cta docs-cta--quiet"
              href="?story=overview--installation"
            >
              Installation
            </a>
          </div>
        </div>

        <div
          className="docs-hero__demo docs-rise"
          style={{ animationDelay: "420ms" }}
        >
          <PlanetCard />
          {/* Name what the demo is and what it is made of, so nobody has to
              guess whether it is a screenshot, a mock, or the real thing. */}
          <p className="docs-hero__caption">
            Live components — Card, Heading, Text, Badge, Separator, Select
            and Button. Nothing composed on: this is what you get from the
            package.
          </p>
        </div>
      </div>
    </section>

    <Reveal>
      <section className="docs-section docs-section--install">
        <div className="docs-section__label">Installation</div>
        <h2 className="docs-section__title">Running in three lines</h2>
        <p className="docs-section__intro">
          One package, one stylesheet, React 19 as a peer dependency. No build
          tooling, no Sass, no theme to configure — the components arrive
          already wearing the design.
        </p>

        <div className="docs-install">
          <div className="docs-install__step">
            <div className="docs-install__num">1</div>
            <div className="docs-install__body">
              <h3 className="docs-install__head">Install</h3>
              <Code
                label="Terminal"
                language="bash"
                code={`pnpm add ${packageName}`}
              />
            </div>
          </div>

          <div className="docs-install__step">
            <div className="docs-install__num">2</div>
            <div className="docs-install__body">
              <h3 className="docs-install__head">Import the stylesheet once</h3>
              <Code
                label="main.tsx"
                code={`import "${packageName}/styles.css";`}
              />
            </div>
          </div>

          <div className="docs-install__step">
            <div className="docs-install__num">3</div>
            <div className="docs-install__body">
              <h3 className="docs-install__head">Use a component</h3>
              <Code
                label="Planet.tsx"
                code={`import { Card, Heading, Badge, Button } from "${packageName}";

export function Planet() {
  return (
    <Card>
      <Heading size="5">Kepler-442b</Heading>
      <Badge color="success">Temperate</Badge>
      <Button>Build planet</Button>
    </Card>
  );
}`}
              />
            </div>
          </div>
        </div>

        <p className="docs-section__intro" style={{ marginBottom: 0 }}>
          That is the whole setup. Requirements, the CJS and ESM entry points
          and what to do about a dark background are covered under{" "}
          <a
            href="?story=overview--installation"
            style={{ color: "var(--docs-readout)" }}
          >
            Installation
          </a>
          .
        </p>
      </section>
    </Reveal>

    <Reveal>
      <section className="docs-section">
        <div className="docs-section__label">The design language</div>
        <h2 className="docs-section__title">
          The design language is the component
        </h2>
        <p className="docs-section__intro">
          Most systems hand you primitives and a theme to paint them with. This
          one does not separate the two. A <code>Button</code> is a lit-glass
          capsule whose rim catches light like a planet's atmosphere; a{" "}
          <code>Slider</code> is a glass tube with a limb-lit moon you drag
          along it. There is no plain mode, because a plain mode would be a
          different library.
        </p>
        <p className="docs-section__intro">
          Underneath it, four constraints the build actually checks — not
          preferences the docs describe. That is the difference between a
          design system and a folder of components.
        </p>

        <div className="docs-principles">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.name} delay={i * 70} className="docs-principle">
              <div className="docs-principle__name">{p.name}</div>
              <p className="docs-principle__body">{p.body}</p>
              <code className="docs-principle__rule">{p.rule}</code>
            </Reveal>
          ))}
        </div>
      </section>
    </Reveal>

    <Reveal>
      <section className="docs-section">
        <div className="docs-section__label">Design tokens</div>
        <h2 className="docs-section__title">Name the job, not the shade</h2>
        <p className="docs-section__intro">
          A numbered ramp makes you guess — is <code>gray-11</code> a label, a
          border, or a placeholder? SpaceUI ships seven grays, each named for
          the work it does, so the name tells you where it belongs and a
          reviewer can tell when it is wrong. Set a role's value once and every
          correct use of it follows.
        </p>

        <TokenExample />

        <h3 className="docs-subhead">Three tiers, one namespace</h3>
        <p className="docs-section__intro">
          Every value in the library resolves through a custom property under{" "}
          <code>--sp-</code>. They fall into three tiers, and knowing which
          tier you are reaching for tells you how far the change will travel.
        </p>

        <div className="docs-tiers">
          {TOKEN_TIERS.map((t, i) => (
            <Reveal key={t.name} delay={i * 70} className="docs-tier">
              <div className="docs-tier__index">{t.reach}</div>
              <div className="docs-tier__name">{t.name}</div>
              <p className="docs-tier__body">{t.body}</p>
              <code className="docs-tier__sample">{t.sample}</code>
            </Reveal>
          ))}
        </div>

        <p className="docs-section__intro">
          Tier three follows one shape without exception —{" "}
          <code>--sp-[component]-[modifier]-[type]</code> — so{" "}
          <code>--sp-progress-track-color</code> tells you the component, the
          part and the kind of value before you look it up. Each component page
          lists its own in a <strong>Custom properties</strong> table.
        </p>

        <h3 className="docs-subhead">Use them in your own CSS</h3>
        <p className="docs-section__intro">
          Tokens are plain CSS custom properties on <code>:root</code>. Nothing
          about them is React-specific — reach for them anywhere, in your own
          components, in a stylesheet, or inline. Spacing lives on an
          eight-point grid with one 4px half-step; when a measurement falls
          between steps, round up.
        </p>
        <Code
          label="PlanetPanel.css"
          language="css"
          code={`/* once, at your app entry */
@import "${packageName}/tokens.css";

.planet-panel {
  background: var(--sp-gray-panel);
  border: 1px solid var(--sp-gray-border);
  padding: var(--spacing-md);  /* 16px \u2014 on the grid */
  gap: var(--spacing-sm);
}

.planet-panel__label {
  color: var(--sp-gray-text-dim);  /* secondary text */
  font-size: var(--sp-font-sm);
}`}
        />

        <h3 className="docs-subhead">Retheme by redefining</h3>
        <p className="docs-section__intro">
          Because every component reads the same roles and nothing else, a whole
          theme — light mode, a brand palette — is one block loaded after the
          library. You override only what you want to change; anything you leave
          out keeps the shipped default, so a theme file is a short diff rather
          than a full palette.
        </p>
        <Code
          label="theme.css \u2014 loaded after styles.css"
          language="css"
          code={`:root {
  /* surfaces */
  --sp-gray-panel: #14161c;
  --sp-gray-border: #8ab4ff2e;

  /* emphasis \u2014 one line moves every interactive surface */
  --sp-primary-solid: #7c5cff;
  --sp-primary-text: #b9a4ff;

  /* the lit glass, stored as channels so alpha stays local */
  --sp-rim-rgb: 190 160 255;
  --sp-glow-rgb: 160 130 255;

  /* the one family pin \u2014 see Foundations */
  --sp-font-family: "Inter", system-ui, sans-serif;
}`}
        />

        <p className="docs-section__intro" style={{ marginTop: 20, marginBottom: 0 }}>
          Every token and its resolved value is listed under{" "}
          <a href="?story=foundations--color" style={{ color: "var(--docs-readout)" }}>
            Foundations
          </a>
          .
        </p>
      </section>
    </Reveal>

    <Reveal>
      <section className="docs-section">
        <div className="docs-section__label">Motion</div>
        <h2 className="docs-section__title">The look is not optional</h2>
        <p className="docs-section__intro">
          Lit glass, an orbiting rim, faint starfield specks — that is what a
          SpaceUI component <em>is</em>. There is no plain mode and no class to
          compose: install it and you get the system. What you can turn off is
          the <strong>motion</strong>, because ambient loops that suit a hero
          button can distract in a dense form or a long list.
        </p>

        <MotionDemo />

        <p className="docs-section__intro">
          Shown on the two components that carry ambient motion. Slider has
          none to still, which is why it takes no <code>animated</code> prop —
          a prop that does nothing is worse than no prop.
        </p>

        <p className="docs-section__intro">
          One prop, one meaning. It stills the orbiting rim, the glint sweep
          and the twinkling stars, and leaves every gradient, rim and shadow
          exactly where they were.
        </p>

        <Code
          label="Stilling the motion"
          code={`/* ambient motion, the default */
<Button>Build planet</Button>

/* same look, no loops */
<Button animated={false}>Build planet</Button>
<TextField animated={false} />
<Select animated={false}>…</Select>`}
        />

        <p className="docs-section__intro" style={{ marginTop: 16, marginBottom: 0 }}>
          Readers who set <code>prefers-reduced-motion</code> get this without
          asking — the library honours it whatever the prop says.
        </p>
      </section>
    </Reveal>

    <Reveal>
      <section className="docs-section">
        <div className="docs-section__label">The components</div>
        <h2 className="docs-section__title">All {componentCount}, and what they cost</h2>
        <p className="docs-section__intro">
          Every page shows the component running, the source behind it, its
          full prop table with defaults, and the custom properties it exposes.
          The whole library is {iconCount} icons and {componentCount} components
          in {minzipKb}&nbsp;kB gzipped, with no runtime dependencies.
        </p>

        <div className="docs-catalogue">
          {CATALOGUE.map(([group, items], i) => (
            <Reveal key={group} delay={i * 50} className="docs-catalogue__group">
              <div className="docs-catalogue__name">{group}</div>
              <ul className="docs-catalogue__list">
                {items.map(([name, story]) => (
                  <li key={name + story}>
                    <a href={`?story=${story}`}>{name}</a>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}

          <Reveal delay={CATALOGUE.length * 50} className="docs-catalogue__group">
            <div className="docs-catalogue__name">Icons</div>
            <ul className="docs-catalogue__list">
              <li>
                <a href="?story=components--icons--all-icons">
                  {iconCount} icons
                </a>
              </li>
            </ul>
          </Reveal>
        </div>
      </section>
    </Reveal>

    <Reveal>
      <section className="docs-section">
        <div className="docs-section__label">Provenance</div>
        <h2 className="docs-section__title">Extracted, not invented</h2>
        <p className="docs-section__intro">
          These components ran in production before they became a package, so
          they arrived with their edge cases already found rather than imagined.
          The extraction kept the rendered output identical — a few deliberate
          exceptions to the spacing grid survive where parity with the shipped
          app beat grid purity, and they are commented where they occur.
        </p>
        <p className="docs-section__intro" style={{ marginBottom: 0 }}>
          Source lives at{" "}
          <a
            href={repoUrl}
            style={{ color: "var(--docs-readout)" }}
            target="_blank"
            rel="noreferrer"
          >
            {repoUrl.replace("https://", "")}
          </a>
          .
        </p>
      </section>
    </Reveal>
  </div>
);

Introduction.meta = { fullBleed: true };

export const Installation = () => (
  <div className="docs-page">
    <h1
      className="docs-hero__title"
      style={{ fontSize: "clamp(28px, 4vw, 40px)" }}
    >
      Installation
    </h1>
    <p className="docs-hero__lede">
      One package, one stylesheet, React 19 as a peer dependency.
    </p>

    <Reveal>
      <section className="docs-section" style={{ marginTop: 32 }}>
        <div className="docs-section__label">Step one</div>
        <h2 className="docs-section__title">Install the package</h2>
        <Code
          label="Terminal"
          language="bash"
          code={`# pnpm
pnpm add ${packageName}

# npm
npm install ${packageName}`}
        />
      </section>
    </Reveal>

    <Reveal>
      <section className="docs-section">
        <div className="docs-section__label">Step two</div>
        <h2 className="docs-section__title">Import the styles once</h2>
        <p className="docs-section__intro">
          One stylesheet, loaded once. The default token values ship inside it,
          so there is nothing else to wire up — and no Sass toolchain is
          required downstream.
        </p>
        <Code
          label="app entry"
          code={`// one import — default token values are baked in
import "${packageName}/styles.css";`}
        />
      </section>
    </Reveal>

    <Reveal>
      <section className="docs-section">
        <div className="docs-section__label">Step three</div>
        <h2 className="docs-section__title">Use a component</h2>
        <Code
          label="Planet.tsx"
          code={`import { Button, Card, Heading } from "${packageName}";

export function Planet() {
  return (
    <Card>
      <Heading size="4">Kepler-442b</Heading>
      <Button>Build planet</Button>
    </Card>
  );
}`}
        />
      </section>
    </Reveal>

    <Reveal>
      <section className="docs-section">
        <div className="docs-section__label">Requirements</div>
        <h2 className="docs-section__title">What you need</h2>
        <ul className="docs-principles">
          <li className="docs-principle">
            <div className="docs-principle__name">React 19</div>
            <p className="docs-principle__body">
              Declared as a peer dependency alongside react-dom. Nothing else is
              required at runtime.
            </p>
            <code className="docs-principle__rule">react &gt;=19</code>
          </li>
          <li className="docs-principle">
            <div className="docs-principle__name">A dark surface</div>
            <p className="docs-principle__body">
              Components are built for the space-dark ground and assume it.
              There is no light theme.
            </p>
            <code className="docs-principle__rule">#111113</code>
          </li>
        </ul>
      </section>
    </Reveal>
  </div>
);

Installation.meta = { fullBleed: true };
