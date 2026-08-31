import { useState, type CSSProperties } from "react";
import {
  Badge,
  Card,
  Heading,
  Select,
  Separator,
  SpaceButton,
  Text,
} from "@inkorange/space-ui";
import { Reveal, Starfield } from "./docs-motion";
import { componentCount, iconCount, packageName, repoUrl } from "./system-facts";

export default {
  title: "Overview",
  meta: { fullBleed: true },
};

/**
 * The hero demo is a planet summary — the shape planet-builder actually
 * renders, not an invented device. Built from the components that appear in
 * most of the app's files (Text, SpaceButton, Heading, Badge, Card) plus a
 * Select, with nothing composed on top: the lit glass is what the package
 * gives you, so this is exactly what a consumer would ship.
 */
const PlanetCard = () => {
  const [star, setStar] = useState("G");

  return (
    <Card style={{ padding: 20 }}>
      <div className="docs-demo__head">
        <Heading size="5">Kepler-442b</Heading>
        <Badge color="green">Temperate</Badge>
      </div>

      <Text size="2" color="gray">
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
        <Text size="1" color="gray">
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
        <SpaceButton>Build planet</SpaceButton>
        <SpaceButton size="sm">View system</SpaceButton>
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

    <div className="docs-code">
      <div className="docs-code__bar">readout.css</div>
      <pre>
        .readout {"{"}
        {DEMO_RULES.map(([prop, value]) => (
          <span key={prop}>
            {"\n  "}
            {prop}: <span className="k">{value}</span>;
          </span>
        ))}
        {"\n"}
        {"}"}
      </pre>
    </div>
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
          <SpaceButton>Build planet</SpaceButton>
          <Select.Root value={liveStar} onValueChange={setLiveStar}>
            <Select.Trigger style={{ minWidth: 160 }} />
            <Select.Content>
              {STAR_TYPES.map((t) => (
                <Select.Item key={t} value={t}>
                  {t}-type star
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>
        <pre className="docs-skindemo__code">&lt;SpaceButton /&gt;</pre>
      </section>

      <section className="docs-skindemo__pane">
        <header className="docs-skindemo__head">
          <span className="docs-skindemo__badge">Motion stilled</span>
          <span className="docs-skindemo__note">animated={"{false}"}</span>
        </header>
        <div className="docs-skindemo__stack">
          <SpaceButton animated={false}>Build planet</SpaceButton>
          <Select.Root value={stillStar} onValueChange={setStillStar}>
            <Select.Trigger animated={false} style={{ minWidth: 160 }} />
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
          &lt;SpaceButton animated={"{false}"} /&gt;
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
            and SpaceButton. Nothing composed on: this is what you get from the
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
        <div className="docs-code">
          <div className="docs-code__bar">PlanetPanel.css</div>
          <pre>
            <span className="c">/* once, at your app entry */</span>
            {"\n"}
            <span className="k">@import</span>{" "}
            <span className="s">"{packageName}/tokens.css"</span>;
            {"\n\n"}.planet-panel {"{"}
            {"\n  "}background: <span className="k">var(--sp-gray-panel)</span>;
            {"\n  "}border: 1px solid <span className="k">var(--sp-gray-border)</span>;
            {"\n  "}padding: <span className="k">var(--spacing-md)</span>;{"  "}
            <span className="c">/* 16px — on the grid */</span>
            {"\n  "}gap: <span className="k">var(--spacing-sm)</span>;
            {"\n"}
            {"}"}
            {"\n\n"}.planet-panel__label {"{"}
            {"\n  "}color: <span className="k">var(--sp-gray-text-dim)</span>;{"  "}
            <span className="c">/* secondary text */</span>
            {"\n  "}font-size: <span className="k">var(--sp-font-sm)</span>;
            {"\n"}
            {"}"}
          </pre>
        </div>

        <h3 className="docs-subhead">Retheme by redefining</h3>
        <p className="docs-section__intro">
          Because every component reads the same roles, rebranding is one block
          of overrides rather than a pass through the component tree. This is
          the payoff for consolidating fifteen grays into seven: a theme change
          is a short diff.
        </p>
        <div className="docs-code">
          <div className="docs-code__bar">theme.css — loaded after tokens.css</div>
          <pre>
            :root {"{"}
            {"\n  "}
            <span className="c">/* surfaces */</span>
            {"\n  "}--sp-gray-panel: <span className="s">#14161c</span>;
            {"\n  "}--sp-gray-border: <span className="s">#8ab4ff2e</span>;
            {"\n\n  "}
            <span className="c">/* primary action, focus, selection */</span>
            {"\n  "}--sp-blue-9: <span className="s">#7c5cff</span>;
            {"\n\n  "}
            <span className="c">/* the one family pin — see Foundations */</span>
            {"\n  "}--sp-font-family: <span className="s">"Inter"</span>, system-ui, sans-serif;
            {"\n"}
            {"}"}
          </pre>
        </div>

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

        <div className="docs-code">
          <div className="docs-code__bar">Stilling the motion</div>
          <pre>
            <span className="c">{"/* ambient motion, the default */"}</span>
            {"\n"}&lt;SpaceButton&gt;Build planet&lt;/SpaceButton&gt;
            {"\n\n"}
            <span className="c">{"/* same look, no loops */"}</span>
            {"\n"}&lt;SpaceButton animated={"{false}"}&gt;Build planet&lt;/SpaceButton&gt;
            {"\n"}&lt;TextField.Root animated={"{false}"} /&gt;
            {"\n"}&lt;Select.Trigger animated={"{false}"} /&gt;
          </pre>
        </div>

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
        <div className="docs-code">
          <div className="docs-code__bar">Terminal</div>
          <pre>
            <span className="c"># pnpm</span>
            {"\n"}pnpm add {packageName}
            {"\n\n"}
            <span className="c"># npm</span>
            {"\n"}npm install {packageName}
          </pre>
        </div>
      </section>
    </Reveal>

    <Reveal>
      <section className="docs-section">
        <div className="docs-section__label">Step two</div>
        <h2 className="docs-section__title">Import the styles once</h2>
        <p className="docs-section__intro">
          Load the tokens and the compiled stylesheet at your app's entry point.
          The CSS ships precompiled, so no Sass toolchain is required
          downstream.
        </p>
        <div className="docs-code">
          <div className="docs-code__bar">app entry</div>
          <pre>
            <span className="k">import</span>{" "}
            <span className="s">"{packageName}/tokens.css"</span>;
            {"\n"}
            <span className="k">import</span>{" "}
            <span className="s">"{packageName}/styles.css"</span>;
          </pre>
        </div>
      </section>
    </Reveal>

    <Reveal>
      <section className="docs-section">
        <div className="docs-section__label">Step three</div>
        <h2 className="docs-section__title">Use a component</h2>
        <div className="docs-code">
          <div className="docs-code__bar">Planet.tsx</div>
          <pre>
            <span className="k">import</span> {"{ SpaceButton, Card, Heading }"}{" "}
            <span className="k">from</span>{" "}
            <span className="s">"{packageName}"</span>;
            {"\n\n"}
            <span className="k">export function</span> Planet() {"{"}
            {"\n  "}
            <span className="k">return</span> (
            {"\n    "}&lt;Card&gt;
            {"\n      "}&lt;Heading size=<span className="s">"4"</span>
            &gt;Kepler-442b&lt;/Heading&gt;
            {"\n      "}&lt;SpaceButton&gt;Build planet&lt;/SpaceButton&gt;
            {"\n    "}&lt;/Card&gt;
            {"\n  "});
            {"\n"}
            {"}"}
          </pre>
        </div>
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
