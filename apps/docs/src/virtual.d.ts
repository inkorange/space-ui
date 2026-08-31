/** Generated at build time by vite-plugin-space-docs.ts from the library source. */
declare module "virtual:space-docs" {
  export type PropDoc = {
    name: string;
    type: string;
    required: boolean;
    description: string;
    defaultValue: string | null;
  };
  export type ComponentDoc = {
    name: string;
    file: string;
    props: PropDoc[];
    tokens: string[];
  };
  export const components: ComponentDoc[];
  export const skinTokens: Record<string, string[]>;
  export const iconNames: string[];
}

/**
 * Ladle's own generated module. `storySource` maps a story id to its whole
 * FILE's source (stories sharing a file share one entry), and `stories`
 * carries the 1-based line range of each individual story within it.
 */
declare module "virtual:generated-list" {
  export const storySource: Record<string, string>;
  export const stories: Record<
    string,
    { locStart: number; locEnd: number; entry: string }
  >;
}

declare module "*.module.scss" {
  const classes: Record<string, string>;
  export default classes;
}
