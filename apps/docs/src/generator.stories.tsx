import { useEffect, useMemo, useRef, useState } from "react";
import { Heading, Text } from "@inkorange/space-ui";
import { Code } from "./docs-code";
import { SpecimenSuite } from "./docs-specimen";
import { DEFAULT_RECIPE, PILL, derive, toCss, type Recipe } from "./token-generator";

export default {
  title: "Palettes",
  meta: { fullBleed: true },
};

/**
 * The preview is not a rendering OF the generated file — it IS the generated
 * file. The CSS below is injected into a style element and the specimen sits
 * inside the attribute it declares, so what you see is what downloads. A
 * preview built any other way can drift from its output, and the one time it
 * does is the time somebody ships it.
 */
const useGeneratedStyle = (css: string) => {
  const ref = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.dataset.docsGenerated = "";
    document.head.append(el);
    ref.current = el;
    return () => {
      el.remove();
      ref.current = null;
    };
  }, []);

  useEffect(() => {
    if (ref.current) ref.current.textContent = css;
  }, [css]);
};

const COLOURS: Array<{ key: "glass" | "light" | "accent"; label: string; help: string }> = [
  { key: "glass", label: "Glass", help: "The plate a surface is cut from" },
  { key: "light", label: "Light", help: "The limb lit along its edge" },
  { key: "accent", label: "Accent", help: "The hue that means “press this”" },
];

export const Generator = () => {
  const [recipe, setRecipe] = useState<Recipe>(DEFAULT_RECIPE);
  const [name, setName] = useState("custom");
  const [copied, setCopied] = useState(false);

  // The name reaches the CSS, so it has to be a usable attribute value.
  const safeName = name.trim().replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase() || "custom";
  const css = useMemo(() => toCss(recipe, safeName), [recipe, safeName]);
  const parts = useMemo(() => derive(recipe), [recipe]);

  useGeneratedStyle(css);

  const set = (patch: Partial<Recipe>) => setRecipe((prev) => ({ ...prev, ...patch }));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(css);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can be refused outright. The block below is
      // selectable, so there is always a way to get the file.
      setCopied(false);
    }
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([css], { type: "text/css" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeName}.css`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="docs-page">
      <h1 className="docs-hero__title" style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>
        Token generator
      </h1>
      <p className="docs-hero__lede">
        Three colours and three lengths describe a whole system, because the library derives the
        rest: every spacing step is a multiple of one base, every radius a step off another, and
        the lit chrome follows the six glass channels. Answer five questions here and take the
        file that answers eighty.
      </p>

      <section className="docs-section" style={{ marginTop: 32 }}>
        <div className="docs-section__label">Controls</div>
        <h2 className="docs-section__title">Six decisions</h2>

        <div className="docs-generator">
          <div className="docs-generator__controls">
            {COLOURS.map(({ key, label, help }) => (
              <label className="docs-generator__field" key={key}>
                <span className="docs-generator__name">{label}</span>
                <input
                  type="color"
                  className="docs-generator__colour"
                  value={recipe[key]}
                  onChange={(e) => set({ [key]: e.target.value } as Partial<Recipe>)}
                />
                <span className="docs-generator__help">{help}</span>
                <code className="docs-generator__value">{recipe[key]}</code>
              </label>
            ))}

            <label className="docs-generator__field">
              <span className="docs-generator__name">Spacing base</span>
              <input
                type="range"
                min={4}
                max={12}
                step={1}
                value={recipe.gridBase}
                onChange={(e) => set({ gridBase: Number(e.target.value) })}
              />
              <span className="docs-generator__help">
                Every gap is a multiple of this — 4 for a dense application, 10 for a roomy one
              </span>
              <code className="docs-generator__value">{recipe.gridBase}px</code>
            </label>

            <label className="docs-generator__field">
              <span className="docs-generator__name">Radius base</span>
              <input
                type="range"
                min={0}
                max={16}
                step={1}
                value={recipe.radiusBase}
                onChange={(e) => set({ radiusBase: Number(e.target.value) })}
              />
              <span className="docs-generator__help">
                0 squares the library off. Circles and pills stay round either way
              </span>
              <code className="docs-generator__value">{recipe.radiusBase}px</code>
            </label>

            <label className="docs-generator__field">
              <span className="docs-generator__name">Button radius</span>
              <input
                type="range"
                min={0}
                max={PILL}
                step={1}
                value={recipe.controlRadius}
                onChange={(e) => set({ controlRadius: Number(e.target.value) })}
              />
              <span className="docs-generator__help">
                Buttons and the controls beside them, kept off the scale above. The top of the
                range is half the tallest control, which is where every size becomes a pill
              </span>
              <code className="docs-generator__value">
                {recipe.controlRadius >= PILL ? "pill" : `${recipe.controlRadius}px`}
              </code>
            </label>

            <label className="docs-generator__field">
              <span className="docs-generator__name">Name</span>
              <input
                type="text"
                className="docs-generator__text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                spellCheck={false}
              />
              <span className="docs-generator__help">
                Becomes the attribute value: <code>data-sp-palette="{safeName}"</code>
              </span>
            </label>
          </div>

          {/* The specimen lives inside the generated attribute, so it is lit
              by the file on the right rather than by anything this page knows. */}
          <div className="docs-generator__preview" data-sp-palette={safeName}>
            <SpecimenSuite />
            <ul className="docs-generator__channels">
              {Object.entries(parts.channels).map(([token, value]) => (
                <li key={token} className="docs-generator__channel">
                  <span
                    className="docs-palette__chip"
                    style={{ background: `rgb(${value})` }}
                  />
                  <code>{token.replace("--sp-", "").replace("-rgb", "")}</code>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="docs-section">
        <div className="docs-section__label">Output</div>
        <h2 className="docs-section__title">Drop this into your application</h2>
        <p className="docs-section__intro">
          Scoped to an attribute rather than <code>:root</code>, which is the shape the shipped
          palettes use — so it composes with them instead of fighting them, and it can light one
          panel as easily as the whole document.
        </p>

        <div className="docs-generator__actions">
          <button type="button" className="docs-generator__button" onClick={copy}>
            {copied ? "Copied" : "Copy CSS"}
          </button>
          <button type="button" className="docs-generator__button" onClick={download}>
            Download {safeName}.css
          </button>
        </div>

        <Code language="css" label={`${safeName}.css`} code={css} maxHeight={420} />
      </section>

      <section className="docs-section">
        <div className="docs-section__label">What it does not touch</div>
        <h2 className="docs-section__title">Contrast, meaning and data</h2>
        <p className="docs-section__intro">
          The generated file moves the light, the action and the two lengths. It leaves the neutral
          text ramp alone, because that carries the contrast guarantees; the status colours alone,
          because success and danger mean something a brand hue should not redefine; and the chart
          series alone, because they are a measured colour-blind ramp where every adjacent pair
          clears ΔE 8.6 under protanopia. Change those deliberately, in your own stylesheet, with
          the measurements re-run.
        </p>
      </section>
    </div>
  );
};

Generator.meta = { fullBleed: true };
