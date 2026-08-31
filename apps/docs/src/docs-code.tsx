import { Highlight, type Language, type PrismTheme } from "prism-react-renderer";

/**
 * Syntax colours drawn from the system's own accent roles rather than a
 * borrowed editor theme — the gallery should look like the design system it
 * documents, down to its code blocks. Values reference the chrome variables
 * in space.css so a palette change carries through here too.
 */
const spaceTheme: PrismTheme = {
  plain: {
    color: "var(--docs-text)",
    backgroundColor: "transparent",
  },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: { color: "var(--docs-muted)", fontStyle: "italic" },
    },
    { types: ["punctuation"], style: { color: "var(--docs-text-dim)" } },
    {
      types: ["tag", "class-name", "function", "maybe-class-name"],
      style: { color: "var(--docs-readout)" },
    },
    {
      types: ["keyword", "operator", "boolean", "builtin"],
      style: { color: "#baa7ff" }, // --sp-violet-11
    },
    {
      types: ["string", "char", "inserted", "attr-value"],
      style: { color: "#3dd68c" }, // --sp-green-11
    },
    {
      types: ["attr-name", "property", "constant", "symbol"],
      style: { color: "#ffca16" }, // --sp-amber-11
    },
    { types: ["number", "unit"], style: { color: "#f76b15" } }, // --sp-orange-9
    { types: ["deleted"], style: { color: "#ff9592" } }, // --sp-red-11
    { types: ["selector", "atrule"], style: { color: "var(--docs-readout)" } },
  ],
};

/**
 * A highlighted code block. Language defaults to tsx because that is what
 * most blocks in this gallery are; pass `css` or `bash` where it isn't.
 */
export const Code = ({
  code,
  language = "tsx",
  label,
  maxHeight,
}: {
  code: string;
  language?: Language;
  label?: string;
  /** Caps the block's height and scrolls inside it — for long story source. */
  maxHeight?: number;
}) => (
  <div className="docs-code">
    {label && <div className="docs-code__bar">{label}</div>}
    <Highlight code={code.trim()} language={language} theme={spaceTheme}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <pre style={maxHeight ? { maxHeight, overflow: "auto" } : undefined}>
          {tokens.map((line, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                // eslint-disable-next-line react/no-array-index-key
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  </div>
);
