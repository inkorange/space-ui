/**
 * Task-shaped guides for component pages, keyed by story id, shown under a
 * "How to" heading between the story source and the API tables.
 *
 * Kept out of story meta on purpose: Ladle requires meta to be statically
 * serializable and keeps string escapes literally, so a multi-line code
 * sample written there renders as one line full of "\n".
 */
export interface HowTo {
  /** The task, phrased as what the reader wants to do. */
  title: string;
  /** One or two sentences on when and why. Inline `code` in backticks. */
  intro?: string;
  steps: Array<{
    text: string;
    code?: string;
    language?: "tsx" | "css" | "bash";
    label?: string;
  }>;
}

export const howTo: Record<string, HowTo[]> = {
  "components--layout--carousel": [
    {
      title: "Show a different number of slides at each screen width",
      intro:
        "The number of slides in view is a design token, `--sp-carousel-view-count`, not state. Change it with media queries and the carousel follows: no resize listeners, no re-render, and nothing to go wrong between the server render and the client.",
      steps: [
        {
          text: "Set the count for the widest layout you design for with `perView`. It is the value used wherever no stylesheet says otherwise.",
          code: `<Carousel aria-label="Featured planets" perView={4} className="featured">
  {slides}
</Carousel>`,
          label: "Featured.tsx",
        },
        {
          text: "Set `--sp-carousel-view-count` on that class for the narrower breakpoints. Fractions work, and are worth using on small screens: a slide cut off at the edge is the cue that the row scrolls.",
          code: `/* Phones: one slide, with the next one peeking in. */
@media (max-width: 639px) {
  .featured {
    --sp-carousel-view-count: 1.2;
  }
}

/* Tablets: two and a half. */
@media (min-width: 640px) and (max-width: 1079px) {
  .featured {
    --sp-carousel-view-count: 2.5;
  }
}

/* 1080px and up: nothing set, so perView={4} applies. */`,
          language: "css",
          label: "featured.css",
        },
        {
          text: "That is all. Slide widths are computed in CSS from the count, and the arrows, dots and page size are measured from what actually rendered, so they update on their own when a breakpoint changes the count.",
        },
      ],
    },
    {
      title: "Know which value wins",
      intro:
        "The carousel resolves its count in this order, so a stylesheet can always override the prop, never the other way round.",
      steps: [
        {
          text: "`--sp-carousel-view-count`, if any stylesheet sets it on the carousel or one of its ancestors.",
        },
        {
          text: "The `perView` prop. The component passes it as a private default rather than setting the public token inline, which would outrank every media query.",
        },
        {
          text: "`1`, if neither is given.",
          code: `/* Inside the component */
--_count: var(--sp-carousel-view-count, var(--_view-count-default, 1));
grid-auto-columns: calc((100% - var(--_gap) * (var(--_count) - 1)) / var(--_count));`,
          language: "css",
          label: "Carousel.module.scss",
        },
      ],
    },
    {
      title: "Apply one rule to several carousels",
      intro:
        "Tokens cascade, so set the count on a shared ancestor instead of on each carousel.",
      steps: [
        {
          text: "Scope it to a section or a page wrapper. Every carousel inside follows the breakpoints, whatever its `perView`.",
          code: `@media (max-width: 639px) {
  .product-page {
    --sp-carousel-view-count: 1.2;
    --sp-carousel-gap-size: 8px;
  }
}`,
          language: "css",
          label: "product-page.css",
        },
        {
          text: "Avoid setting it on `:root` unless you mean it. There it overrides the `perView` prop of every carousel in the app, which is rarely what you want.",
        },
        {
          text: "Container queries work too, since this is plain CSS. Use `@container` in place of `@media` to size the row by the space it sits in, not by the window.",
          code: `.sidebar {
  container-type: inline-size;
}

@container (max-width: 400px) {
  .sidebar .featured {
    --sp-carousel-view-count: 1.2;
  }
}`,
          language: "css",
          label: "sidebar.css",
        },
      ],
    },
  ],
};
