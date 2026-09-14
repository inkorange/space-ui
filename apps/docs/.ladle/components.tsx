import { ActionType, ModeState, type GlobalProvider } from "@ladle/react";
import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  components as componentDocs,
  type ComponentDoc,
  type PropDoc,
} from "virtual:space-docs";
import { storySource, stories } from "virtual:generated-list";
import { Code } from "../src/docs-code";
import { PackageLinks } from "../src/docs-links";
import "@inkorange/space-ui/tokens.css";
import "./space.css";
import {
  componentCount,
  coveragePct,
  iconCount,
  minzipKb,
  isPublished,
  version,
} from "../src/system-facts";

/**
 * Ladle gives the sidebar no slot for branding, so the brand block is
 * portalled into `nav.ladle-aside`. It is APPENDED rather than prepended —
 * a foreign node ahead of React's own children is the one position that can
 * confuse reconciliation — and CSS `order: -1` lifts it to the top.
 */
const useSidebarSlot = () => {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const nav = document.querySelector("nav.ladle-aside");
    // No sidebar in preview mode or inside a story iframe.
    if (!nav) return;

    nav.id = "docs-nav";
    const el = document.createElement("div");
    el.className = "docs-brand";
    nav.append(el);
    setSlot(el);

    return () => {
      el.remove();
      setSlot(null);
    };
  }, []);

  return slot;
};

const Brand = () => (
  <>
    <a className="docs-brand__mark" href="?story=overview--introduction">
      {/* aria-hidden: the link's own text already says SpaceUI, so an alt
          here would just make a screen reader say the name twice. */}
      <img
        className="docs-brand__logo"
        src="/logo-64.png"
        width={32}
        height={32}
        alt=""
        aria-hidden="true"
      />
      <span>
        <span className="docs-brand__name">SpaceUI</span>
        <span className="docs-brand__sub">@inkorange/space-ui</span>
      </span>
    </a>

    <PackageLinks className="docs-links--sidebar" />

    <div className="docs-telemetry">
      <div className="docs-telemetry__cell">
        <div className="docs-telemetry__value">{componentCount}</div>
        <div className="docs-telemetry__label">Components</div>
      </div>
      <div className="docs-telemetry__cell">
        <div className="docs-telemetry__value">{iconCount}</div>
        <div className="docs-telemetry__label">Icons</div>
      </div>
      <div className="docs-telemetry__cell">
        <div className="docs-telemetry__value">0</div>
        <div className="docs-telemetry__label">Dependencies</div>
      </div>
      <div className="docs-telemetry__cell">
        <div className="docs-telemetry__value">19</div>
        <div className="docs-telemetry__label">React</div>
      </div>
      <div className="docs-telemetry__cell">
        <div className="docs-telemetry__value">{minzipKb}<span className="docs-telemetry__unit">kB</span></div>
        <div className="docs-telemetry__label">Minzip</div>
      </div>
      <div className="docs-telemetry__cell">
        {/* Rounded for display; measured.json keeps the precise value, and
            the README badge rounds the same way. */}
        <div className="docs-telemetry__value">{Math.round(coveragePct)}<span className="docs-telemetry__unit">%</span></div>
        <div className="docs-telemetry__label">Coverage</div>
      </div>
      <div className={`docs-status${isPublished ? " docs-status--live" : ""}`}>
        <span className="docs-status__dot" aria-hidden="true" />
        <span>
          {isPublished ? `v${version} on npm` : `v${version} · pre-release`}
        </span>
      </div>
    </div>
  </>
);

/**
 * Below 768px there is no room for the sidebar beside the story. Ladle's own
 * answer is to stack it underneath, which on a phone puts the whole
 * navigation after the longest page of source and API tables — effectively
 * nowhere. So on a narrow screen the sidebar becomes a drawer: a bar pinned
 * to the top opens it, and choosing a story, Escape, or a tap outside closes
 * it. Closed, the nav is inert, so keyboard and screen-reader users do not
 * wander into an off-screen list.
 */
const MOBILE = "(max-width: 767px)";

const useMobileNav = (story: string) => {
  const [open, setOpen] = useState(false);

  // A new story means a link in the drawer was chosen.
  useEffect(() => {
    setOpen(false);
  }, [story]);

  useEffect(() => {
    const root = document.documentElement;
    const nav = document.querySelector<HTMLElement>("nav.ladle-aside");
    const media = window.matchMedia(MOBILE);

    const apply = () => {
      const mobile = media.matches;
      if (open && mobile) root.dataset.docsNav = "open";
      else delete root.dataset.docsNav;
      if (nav) nav.inert = mobile && !open;
    };
    apply();
    media.addEventListener("change", apply);

    if (open) {
      nav?.querySelector<HTMLElement>("input, a")?.focus({ preventScroll: true });
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        document.querySelector<HTMLElement>(".docs-mobilebar__menu")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      media.removeEventListener("change", apply);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return [open, setOpen] as const;
};

const MobileBar = ({ open, onToggle }: { open: boolean; onToggle: () => void }) => (
  <>
    <div className="docs-mobilebar">
      <a className="docs-mobilebar__brand" href="?story=overview--introduction">
        <img src="/logo-64.png" width={24} height={24} alt="" aria-hidden="true" />
        <span>SpaceUI</span>
      </a>
      <button
        type="button"
        className="docs-mobilebar__menu"
        aria-expanded={open}
        aria-controls="docs-nav"
        onClick={onToggle}
      >
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          {open ? (
            <path d="M3.5 3.5l9 9m0-9l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          ) : (
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          )}
        </svg>
        {open ? "Close" : "Components"}
      </button>
    </div>
    {/* The scrim is for pointers; keyboard users close with Escape. */}
    <div className="docs-mobilebar__scrim" aria-hidden="true" onClick={onToggle} />
  </>
);

/** `components--buttons--loader` → levels ["Components", "Buttons"], name "Loader". */
const parseStoryId = (id: string) => {
  const parts = id.split("--").map((part) =>
    part
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
  );
  return { name: parts.pop() ?? "", levels: parts };
};

/**
 * Which components a story is ABOUT — not merely which ones it renders.
 *
 * A story reaches for other components as scaffolding: the Tabs story puts
 * Text inside a panel because a tab needs contents. Documenting those would
 * turn every page into a partial copy of its neighbours, so the set is
 * narrowed to components the story is named for.
 *
 * A story can state it outright with `meta.components` where the name does
 * not carry it — "Text sizes" is about Text, and nothing in the name says so.
 */
const componentsInSource = (
  src: string,
  storyId: string,
  declared?: string[],
): ComponentDoc[] => {
  const rendered = new Set<string>();
  for (const m of src.matchAll(/<([A-Z][A-Za-z0-9]*(?:\.[A-Z][A-Za-z0-9]*)?)/g)) {
    rendered.add(m[1]);
  }

  if (declared) {
    return componentDocs.filter((doc) =>
      declared.some((d) => doc.name === d || doc.name.startsWith(`${d}.`)),
    );
  }

  // "components--overlays--tabs" -> "tabs" -> Tabs, Tabs.Trigger, …
  // The trailing plural is dropped so "buttons" finds Button.
  const leaf = storyId.split("--").pop() ?? "";
  const pascal = leaf
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
  const candidates = [pascal, pascal.replace(/s$/, "")].filter(Boolean);

  const owned = componentDocs.filter(
    (doc) =>
      rendered.has(doc.name) &&
      candidates.some((c) => doc.name === c || doc.name.startsWith(`${c}.`)),
  );

  // A story whose name matches nothing documents everything it renders — an
  // empty table is worse than a broad one.
  return owned.length
    ? owned
    : componentDocs.filter((doc) => rendered.has(doc.name));
};

/**
 * Turns a heritage clause into something a reader can act on. The tables list
 * only a component's own props, so without this a Button looks like it
 * takes five props and no onClick — when in fact it forwards every standard
 * button attribute.
 */
const describeHeritage = (clause: string): string | null => {
  const dom = /(\w+)HTMLAttributes<(\w+)>/.exec(clause);
  if (dom) {
    const omitted = [...clause.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    const base = `every standard ${dom[1].toLowerCase()} attribute — onClick, id, aria-*, data-*`;
    return omitted.length ? `${base} (except ${omitted.join(", ")})` : base;
  }
  if (clause === "SpacingProps") return "margin and padding steps — m, mt, mb, p, pb";
  return null;
};

const PropRow = ({ prop: p, inherited }: { prop: PropDoc; inherited?: boolean }) => (
  <div
    className={`docs-api__row${inherited ? " docs-api__row--inherited" : ""}`}
    role="row"
  >
    <span className="docs-api__prop" role="cell">
      {p.name}
      {p.required && (
        <span className="docs-api__required" title="Required">
          *
        </span>
      )}
    </span>
    <span className="docs-api__type" role="cell">
      {p.type}
    </span>
    <span className="docs-api__default" role="cell">
      {p.defaultValue ?? "—"}
    </span>
    <span className="docs-api__desc" role="cell">
      {p.description || <em>—</em>}
    </span>
  </div>
);

const INHERITED_PREVIEW = 4;

const PropsTable = ({ doc }: { doc: ComponentDoc }) => {
  const [showAllInherited, setShowAllInherited] = useState(false);
  const shown = showAllInherited
    ? doc.inherited
    : doc.inherited.slice(0, INHERITED_PREVIEW);
  const hidden = doc.inherited.length - shown.length;

  return (
  <div className="docs-api">
    <div className="docs-api__head">
      <span className="docs-api__name">{`<${doc.name}>`}</span>
      <span className="docs-api__file">{doc.file}</span>
    </div>

    {/* What the component IS. A prop table can only say what it takes. */}
    {doc.description && (
      <p className="docs-api__about">{doc.description}</p>
    )}

    <div className="docs-api__table" role="table">
      <div className="docs-api__row docs-api__row--head" role="row">
        <span role="columnheader">Prop</span>
        <span role="columnheader">Type</span>
        <span role="columnheader">Default</span>
        <span role="columnheader">Description</span>
      </div>

      {doc.props.map((p) => (
        <PropRow key={p.name} prop={p} />
      ))}

      {doc.inherited.length > 0 && (
        <>
          <div className="docs-api__row docs-api__row--section" role="row">
            <span>Inherited from {doc.file.replace(".tsx", "")}'s element</span>
          </div>
          {shown.map((p) => (
            <PropRow key={p.name} prop={p} inherited />
          ))}
          <div className="docs-api__row docs-api__row--more" role="row">
            <button
              type="button"
              className="docs-api__more"
              aria-expanded={showAllInherited}
              onClick={() => setShowAllInherited((v) => !v)}
            >
              {showAllInherited
                ? "Show fewer"
                : `Show all ${doc.inherited.length}`}
            </button>
            <span className="docs-api__morenote">
              {showAllInherited
                ? `${doc.inheritedCount - doc.inherited.length} more inherited props are not listed`
                : `${hidden} more listed, ${doc.inheritedCount} inherited in total`}
            </span>
          </div>
        </>
      )}
    </div>

    {/* The objects a caller has to build. The props table names these types
        and nothing more, which leaves a reader to go find the source to learn
        what a `pagination` actually needs. */}
    {doc.types.map((shape) => (
      <div key={shape.name} className="docs-api__shape">
        <div className="docs-api__head">
          <span className="docs-api__name">{shape.name}</span>
          <span className="docs-api__file">
            passed as {shape.usedBy.map((u, i) => (
              <span key={u}>
                {i > 0 && ", "}
                <code>{u}</code>
              </span>
            ))}
          </span>
        </div>
        {shape.description && <p className="docs-api__about">{shape.description}</p>}
        <div className="docs-api__table" role="table">
          <div className="docs-api__row docs-api__row--head" role="row">
            <span role="columnheader">Field</span>
            <span role="columnheader">Type</span>
            <span role="columnheader">Default</span>
            <span role="columnheader">Description</span>
          </div>
          {shape.fields.map((f) => (
            <PropRow key={f.name} prop={f} />
          ))}
        </div>
      </div>
    ))}

    {doc.extendsFrom.length > 0 && (
      <div className="docs-api__extends">
        <span className="docs-api__tokenlabel">Also accepts</span>
        <ul>
          {doc.extendsFrom.map((clause) => {
            const note = describeHeritage(clause);
            return (
              <li key={clause}>
                <code>{clause}</code>
                {note && <span> — {note}</span>}
              </li>
            );
          })}
        </ul>
      </div>
    )}

    {/* Only component-scoped properties. The global --sp-* palette is how
        every component is built, not something you tune per component — it is
        documented once under Foundations. */}
    {doc.tokens.length > 0 && (
      <div className="docs-api__customprops">
        <div className="docs-api__head">
          <span className="docs-api__name">Custom properties</span>
          <span className="docs-api__file">
            set on the component or any ancestor
          </span>
        </div>
        <div className="docs-api__table" role="table">
          <div className="docs-api__row docs-api__row--head docs-api__row--token" role="row">
            <span role="columnheader">Property</span>
            <span role="columnheader">Default</span>
            <span role="columnheader">Effect when overridden</span>
          </div>
          {doc.tokens.map((t) => (
            <div className="docs-api__row docs-api__row--token" role="row" key={t.name}>
              <span className="docs-api__prop" role="cell">
                {t.name}
              </span>
              <span className="docs-api__default" role="cell">
                {t.defaults.length ? t.defaults.join(" / ") : "—"}
              </span>
              <span className="docs-api__desc" role="cell">
                {t.description || <em>—</em>}
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
    </div>
  );
};

export const Provider: GlobalProvider = ({
  children,
  globalState,
  dispatch,
  storyMeta,
}) => {
  const slot = useSidebarSlot();
  const [navOpen, setNavOpen] = useMobileNav(globalState.story);
  const { name, levels } = parseStoryId(globalState.story);

  const meta = storyMeta as
    | {
        description?: string;
        fullBleed?: boolean;
        components?: string[];
        /** Set false on a page whose source is a list of examples rather than
         *  a usage example — a specimen sheet teaches nothing by showing how
         *  it was assembled. */
        source?: boolean;
      }
    | undefined;

  // Overview and Foundations render as full pages; component stories render
  // as specimens inside a frame.
  const fullBleed = meta?.fullBleed === true;

  // Ladle's addon bar renders outside this tree and only makes sense against
  // a specimen. On the marketing pages there is no component to inspect, so
  // flag the page kind here and let space.css hide it.
  useEffect(() => {
    document.documentElement.dataset.docsPage = fullBleed
      ? "marketing"
      : "story";
  }, [fullBleed]);

  // Ladle's preview mode renders ONLY the story — no sidebar, no addon bar,
  // and so no visible way back. The `f` hotkey still works (registered in
  // app.tsx before that early return) but it is documented only in the
  // tooltip of the button that just disappeared. Give it a way out.
  if (globalState.mode === ModeState.Preview) {
    return (
      <>
        {children}
        <button
          type="button"
          className="docs-exit-fullscreen"
          onClick={() =>
            dispatch({ type: ActionType.UpdateMode, value: ModeState.Full })
          }
        >
          Exit fullscreen <kbd>F</kbd>
        </button>
      </>
    );
  }

  // storySource keys a story to its whole FILE, so every story in
  // buttons.stories.tsx would otherwise print Loader, Progress and
  // IconToggle too. `stories` carries each story's own 1-based line range;
  // slice to it so the listing is only the story being viewed.
  const source = (() => {
    const raw = storySource[globalState.story];
    if (!raw) return "";
    const whole = decodeURIComponent(raw);
    const loc = stories[globalState.story];
    if (!loc?.locStart || !loc?.locEnd) return whole.trim();
    return whole.split("\n").slice(loc.locStart - 1, loc.locEnd).join("\n").trim();
  })();

  const docs = source
    ? componentsInSource(source, globalState.story, meta?.components)
    : [];

  return (
    <>
      {slot && createPortal(<Brand />, slot)}
      <MobileBar open={navOpen} onToggle={() => setNavOpen((v) => !v)} />

      <div className="docs-shell">
        {fullBleed ? (
          children
        ) : (
          <>
            <header className="docs-storyhead">
              {levels.length > 0 && (
                <div className="docs-storyhead__eyebrow">
                  {levels.join(" / ")} <span>/</span> {name}
                </div>
              )}
              <h1 className="docs-storyhead__title">{name}</h1>
              {meta?.description && (
                <p className="docs-storyhead__desc">{meta.description}</p>
              )}
            </header>

            <div className="docs-specimen">
              <div className="docs-specimen__bar">
                <span className="docs-specimen__dot" aria-hidden="true" />
                {globalState.story}
              </div>
              <div className="docs-specimen__body">{children}</div>
            </div>

            {/* Source is always visible rather than behind a toggle: reading
                the code is how someone decides whether to adopt a component,
                so it should not cost a click to find. */}
            {source && meta?.source !== false && (
              <section className="docs-source">
                <Code
                  code={source}
                  label={stories[globalState.story]?.entry ?? "Source"}
                  maxHeight={460}
                />
              </section>
            )}

            {docs.length > 0 && (
              <section className="docs-apis">
                <h2 className="docs-apis__title">API</h2>
                <p className="docs-apis__note">
                  Generated from the library source — types, defaults and
                  descriptions come from the components themselves, so this
                  cannot drift from what ships.
                </p>
                {docs.map((doc) => (
                  <PropsTable key={doc.name} doc={doc} />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
};
