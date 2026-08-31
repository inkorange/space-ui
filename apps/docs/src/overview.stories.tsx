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
import { componentCount, iconCount, packageName, repoUrl } from "./system-facts";

export default {
  title: "Overview",
  meta: { fullBleed: true },
};

/**
 * The hero demo is a planet summary — the shape planet-builder actually
 * renders, not an invented device. Built from the components that appear in
 * most of the app's files (Text, Button, Heading, Badge, Card) plus a
 * Select, with nothing composed on top: the lit glass is what the package
 * gives you, so this is exactly what a consumer would ship.
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
        <Select.Root value={star} onValueChange={setStar}>
          <Select.Trigger />
          <Select.Content>
            {STAR_TYPES.map((t) => (
              <Select.Item key={t} value={t}>
                {t}-type star
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
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
          <Select.Root value={liveStar} onValueChange={setLiveStar}>
            <Select.Trigger />
            <Select.Content>
              {STAR_TYPES.map((t) => (
                <Select.Item key={t} value={t}>
                  {t}-type star
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
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
          <Select.Root value={stillStar} onValueChange={setStillStar}>
            <Select.Trigger animated={false} />
            <Select.Content animated={false}>
              {STAR_TYPES.map((t) => (
                <Select.Item key={t} value={t}>
                  {t}-type star
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>
        <pre className="docs-skindemo__code">
          &lt;Button animated={"{false}"} /&gt;
        </pre>
      </section>
    </div>
  );
};

const PRINCIPLES = [
  {
    name: "Eight-point spacing",
    body: "Every gap, inset, and offset lands on the grid. Off-grid values round up to the next step rather than down, so density never creeps in by accident.",
    rule: "12px → 16px",
  },
  {
    name: "Seven gray roles",
    body: "Grays are named for the job they do, not the step they sit on. Fifteen Radix variants collapsed into seven roles, which is why a theme change is a seven-line diff.",
    rule: "--sp-gray-text-dim",
  },
  {
    name: "No framework in the surface",
    body: "No Radix, no runtime dependencies, no framework-specific props. A test suite fails the build if a Radix import reappears, so the boundary holds over time.",
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
            Components for dark,
            <br />
            instrument-dense <em>interfaces</em>.
          </h1>

          <p
            className="docs-hero__lede docs-rise"
            style={{ animationDelay: "220ms" }}
          >
            The design system behind planet-builder, extracted so other projects
            can use it. {componentCount} React components and {iconCount} icons
            on a seven-role token system, with zero runtime dependencies.
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
      <section className="docs-section">
        <div className="docs-section__label">Principles</div>
        <h2 className="docs-section__title">Four rules, enforced</h2>
        <p className="docs-section__intro">
          Each of these is a constraint the build checks, not a preference the
          docs describe. That is the difference between a design system and a
          folder of components.
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
          Radix gave us fifteen numbered grays. A numbered ramp makes you guess
          — is <code>gray-11</code> a label, a border, or a placeholder? SpaceUI
          ships seven, each named for the work it does, so the name tells you
          where it belongs and a reviewer can tell when it is wrong. Set a
          role's value once and every correct use of it follows.
        </p>

        <TokenExample />

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
          Every token, its resolved value, and the Radix variant it replaced is
          listed under{" "}
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
<TextField.Root animated={false} />
<Select.Trigger animated={false} />`}
        />

        <p className="docs-section__intro" style={{ marginTop: 16, marginBottom: 0 }}>
          Readers who set <code>prefers-reduced-motion</code> get this without
          asking — the library honours it whatever the prop says.
        </p>
      </section>
    </Reveal>

    <Reveal>
      <section className="docs-section">
        <div className="docs-section__label">Provenance</div>
        <h2 className="docs-section__title">Extracted, not invented</h2>
        <p className="docs-section__intro">
          These components ran in production in planet-builder before they
          became a package. The extraction kept the rendered output identical —
          a few deliberate exceptions to the spacing grid survive where parity
          with the shipped app beat grid purity, and they are commented where
          they occur. Two components stayed behind because they were coupled to
          the app's framework: SceneLoadingOverlay and ImageWithFallback.
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

    <div className="docs-callout">
      <span className="docs-callout__dot" aria-hidden="true" />
      <div>
        <div className="docs-callout__title">Not published yet</div>
        <p className="docs-callout__body">
          {packageName} is not on npm — the install command below will not
          resolve today. The package is complete and the release is gated on a
          final review of this gallery. Until then, browse the components here
          or build from source.
        </p>
      </div>
    </div>

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
