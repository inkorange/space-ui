import { readdirSync, readFileSync } from "node:fs";
import { resolve, basename } from "node:path";
import ts from "typescript";
import type { Plugin } from "vite";

/**
 * Generates the API reference straight from the library source at build time.
 *
 * Hand-written prop tables drift the moment someone adds a prop, and a docs
 * site that lies about the API is worse than one that says nothing. Everything
 * here is derived: prop names, types and optionality from the TypeScript AST,
 * descriptions from the JSDoc already on each member, defaults from the
 * component's own destructuring pattern, and token usage from the SCSS.
 *
 * Exposed as `virtual:space-docs`.
 */

const COMPONENTS_DIR = resolve(__dirname, "../../packages/space-ui/src/components");
const STYLES_DIR = resolve(__dirname, "../../packages/space-ui/src/styles");

export type PropDoc = {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue: string | null;
};

export type ComponentDoc = {
  /** "SpaceButton", or "Select.Trigger" for a namespaced part. */
  name: string;
  file: string;
  props: PropDoc[];
  /** Tokens the component's own stylesheet references. */
  tokens: string[];
};

const isSourceFile = (f: string) =>
  f.endsWith(".tsx") && !f.includes(".test.") && f !== "icons.tsx";

/** JSDoc text attached to a member, flattened to one line. */
const docOf = (node: ts.Node): string => {
  const jsDoc = (node as unknown as { jsDoc?: ts.JSDoc[] }).jsDoc;
  if (!jsDoc?.length) return "";
  const raw = jsDoc[jsDoc.length - 1].comment;
  const text =
    typeof raw === "string"
      ? raw
      : Array.isArray(raw)
        ? raw.map((p) => ("text" in p ? p.text : "")).join("")
        : "";
  return text.replace(/\s+/g, " ").trim();
};

/**
 * Collects `{ size = "md", fullWidth }` style defaults from the component's
 * first parameter, which is where every component in this library declares
 * them. Keyed by prop name.
 */
const collectDefaults = (source: ts.SourceFile): Map<string, string> => {
  const defaults = new Map<string, string>();

  const visit = (node: ts.Node) => {
    const params = ts.isFunctionDeclaration(node)
      ? node.parameters
      : ts.isFunctionExpression(node) || ts.isArrowFunction(node)
        ? node.parameters
        : undefined;

    if (params?.length && ts.isObjectBindingPattern(params[0].name)) {
      for (const el of params[0].name.elements) {
        if (el.initializer && ts.isIdentifier(el.name)) {
          defaults.set(el.name.text, el.initializer.getText(source));
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(source);
  return defaults;
};

/** Every `var(--sp-*)` / `var(--spacing-*)` a stylesheet references. */
const tokensIn = (css: string): string[] => {
  const found = new Set<string>();
  for (const m of css.matchAll(/var\(\s*(--(?:sp|spacing)-[a-zA-Z0-9-]+)/g)) {
    found.add(m[1]);
  }
  return [...found].sort();
};

const readStyles = (fileBase: string): string => {
  try {
    return readFileSync(resolve(COMPONENTS_DIR, `${fileBase}.module.scss`), "utf8");
  } catch {
    return "";
  }
};

const isExported = (node: ts.Node): boolean =>
  !!ts.getCombinedModifierFlags(node as ts.Declaration) &&
  (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0;

const buildDocs = (): ComponentDoc[] => {
  const docs: ComponentDoc[] = [];
  const seen = new Set<string>();

  for (const file of readdirSync(COMPONENTS_DIR).filter(isSourceFile)) {
    const fileBase = basename(file, ".tsx");
    const code = readFileSync(resolve(COMPONENTS_DIR, file), "utf8");
    const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const defaults = collectDefaults(source);
    const tokens = tokensIn(readStyles(fileBase));

    source.forEachChild((node) => {
      if (!ts.isInterfaceDeclaration(node) && !ts.isTypeAliasDeclaration(node)) return;
      const declName = node.name.text;
      if (!declName.endsWith("Props")) return;

      const members: ts.NodeArray<ts.TypeElement> | undefined = ts.isInterfaceDeclaration(node)
        ? node.members
        : ts.isTypeLiteralNode(node.type)
          ? node.type.members
          : undefined;
      if (!members) return;

      const props: PropDoc[] = [];
      for (const member of members) {
        if (!ts.isPropertySignature(member) || !member.name) continue;
        const name = member.name.getText(source).replace(/^["']|["']$/g, "");
        props.push({
          name,
          type: member.type ? member.type.getText(source).replace(/\s+/g, " ") : "unknown",
          required: !member.questionToken,
          description: docOf(member),
          defaultValue: defaults.get(name) ?? null,
        });
      }
      if (!props.length) return;

      // `SpaceButtonProps` in SpaceButton.tsx documents <SpaceButton>;
      // `TriggerProps` in Select.tsx documents <Select.Trigger>.
      const stem = declName.slice(0, -"Props".length);
      const name = stem === fileBase ? fileBase : `${fileBase}.${stem}`;

      docs.push({ name, file, props, tokens });
      seen.add(name);
    });

    // Several components (Tabs, IconToggle, …) declare their props as an
    // inline type literal on the parameter instead of a named `*Props`
    // interface. Without this pass they'd be silently missing from the
    // reference, which is exactly the kind of gap that makes a docs site
    // untrustworthy.
    source.forEachChild((node) => {
      let fnName: string | undefined;
      let params: ts.NodeArray<ts.ParameterDeclaration> | undefined;

      if (ts.isFunctionDeclaration(node) && node.name && isExported(node)) {
        fnName = node.name.text;
        params = node.parameters;
      } else if (ts.isVariableStatement(node) && isExported(node)) {
        const decl = node.declarationList.declarations[0];
        if (decl && ts.isIdentifier(decl.name) && decl.initializer) {
          const init = decl.initializer;
          if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) {
            fnName = decl.name.text;
            params = init.parameters;
          }
        }
      }

      const typeNode = params?.[0]?.type;
      if (!fnName || !typeNode || !ts.isTypeLiteralNode(typeNode)) return;

      const name = fnName === fileBase ? fileBase : `${fileBase}.${fnName}`;
      if (seen.has(name)) return;

      const props: PropDoc[] = [];
      for (const member of typeNode.members) {
        if (!ts.isPropertySignature(member) || !member.name) continue;
        const propName = member.name.getText(source).replace(/^["']|["']$/g, "");
        props.push({
          name: propName,
          type: member.type ? member.type.getText(source).replace(/\s+/g, " ") : "unknown",
          required: !member.questionToken,
          description: docOf(member),
          defaultValue: defaults.get(propName) ?? null,
        });
      }
      if (!props.length) return;

      docs.push({ name, file, props, tokens });
      seen.add(name);
    });
  }

  return docs.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Icon names, read from icons.tsx itself. A name-suffix heuristic gets this
 * wrong: `Pencil` and `Share` are icons without the `Icon` suffix, so any
 * `endsWith("Icon")` test both undercounts the icons and miscounts those two
 * as components.
 */
const buildIconNames = (): string[] => {
  try {
    const code = readFileSync(resolve(COMPONENTS_DIR, "icons.tsx"), "utf8");
    return [...code.matchAll(/^export (?:const|function) ([A-Z][A-Za-z0-9]*)/gm)]
      .map((m) => m[1])
      .sort();
  } catch {
    return [];
  }
};

/** Tokens referenced by the shared skin layer, grouped by its class. */
const buildSkinTokens = (): Record<string, string[]> => {
  try {
    const css = readFileSync(resolve(STYLES_DIR, "spaceControls.module.scss"), "utf8");
    const out: Record<string, string[]> = {};
    for (const m of css.matchAll(/^\.(\w+)\.\1\s*\{/gm)) {
      const start = m.index ?? 0;
      const next = css.indexOf("\n.", start + 1);
      out[m[1]] = tokensIn(css.slice(start, next === -1 ? undefined : next));
    }
    return out;
  } catch {
    return {};
  }
};

export const spaceDocsPlugin = (): Plugin => {
  const virtualId = "virtual:space-docs";
  const resolvedId = "\0" + virtualId;

  return {
    name: "space-docs",

    resolveId(id) {
      if (id === virtualId) return resolvedId;
    },

    load(id) {
      if (id !== resolvedId) return;
      return [
        `export const components = ${JSON.stringify(buildDocs())};`,
        `export const skinTokens = ${JSON.stringify(buildSkinTokens())};`,
        `export const iconNames = ${JSON.stringify(buildIconNames())};`,
      ].join("\n");
    },

    // Regenerate when the library's source or styles change.
    configureServer(server) {
      const watched = [COMPONENTS_DIR, STYLES_DIR];
      server.watcher.add(watched);
      server.watcher.on("change", (path) => {
        if (!watched.some((dir) => path.startsWith(dir))) return;
        const mod = server.moduleGraph.getModuleById(resolvedId);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
          server.ws.send({ type: "full-reload" });
        }
      });
    },
  };
};
