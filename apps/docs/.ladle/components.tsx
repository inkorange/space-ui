import { ActionType, ModeState, type GlobalProvider } from "@ladle/react";
import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { components as componentDocs, type ComponentDoc } from "virtual:space-docs";
import { storySource, stories } from "virtual:generated-list";
import "@inkorange/space-ui/tokens.css";
import "./space.css";
import {
  componentCount,
  iconCount,
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
      <span className="docs-brand__disc" aria-hidden="true" />
      <span>
        <span className="docs-brand__name">SpaceUI</span>
        <span className="docs-brand__sub">@inkorange/space-ui</span>
      </span>
    </a>

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
        <div className="docs-telemetry__label">Runtime deps</div>
      </div>
      <div className="docs-telemetry__cell">
        <div className="docs-telemetry__value">19</div>
        <div className="docs-telemetry__label">React</div>
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
 * Which documented components a story actually renders, read from the story's
 * own source. Deriving it beats a hand-maintained list on every story: a new
 * story gets its API table for free, and one can never fall out of date with
 * what the story renders.
 */
const componentsInSource = (src: string): ComponentDoc[] => {
  const tags = new Set<string>();
  for (const m of src.matchAll(/<([A-Z][A-Za-z0-9]*(?:\.[A-Z][A-Za-z0-9]*)?)/g)) {
    tags.add(m[1]);
  }
  return componentDocs.filter((doc) => tags.has(doc.name));
};

const PropsTable = ({ doc }: { doc: ComponentDoc }) => (
  <div className="docs-api">
    <div className="docs-api__head">
      <span className="docs-api__name">{`<${doc.name}>`}</span>
      <span className="docs-api__file">{doc.file}</span>
    </div>

    <div className="docs-api__table" role="table">
      <div className="docs-api__row docs-api__row--head" role="row">
        <span role="columnheader">Prop</span>
        <span role="columnheader">Type</span>
        <span role="columnheader">Default</span>
        <span role="columnheader">Description</span>
      </div>

      {doc.props.map((p) => (
        <div className="docs-api__row" role="row" key={p.name}>
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
      ))}
    </div>

    {doc.tokens.length > 0 && (
      <div className="docs-api__tokens">
        <span className="docs-api__tokenlabel">Tokens used</span>
        {doc.tokens.map((t) => (
          <code key={t}>{t}</code>
        ))}
      </div>
    )}
  </div>
);

export const Provider: GlobalProvider = ({
  children,
  globalState,
  dispatch,
  storyMeta,
}) => {
  const slot = useSidebarSlot();
  const { name, levels } = parseStoryId(globalState.story);

  const meta = storyMeta as
    | { description?: string; fullBleed?: boolean }
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

  const docs = source ? componentsInSource(source) : [];

  return (
    <>
      {slot && createPortal(<Brand />, slot)}

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
            {source && (
              <section className="docs-source">
                <div className="docs-code">
                  <div className="docs-code__bar">
                    {stories[globalState.story]?.entry ?? "Source"}
                  </div>
                  <pre>{source}</pre>
                </div>
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
