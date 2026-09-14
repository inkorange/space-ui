import { useState } from "react";
import { Box, Card, Flex, Grid, Heading, Pagination, Text } from "@inkorange/space-ui";

export default {
  title: "Components/Layout",
};

/* An inline SVG stands in for a photograph so the gallery pulls no network
   image — the point is the framing the card applies, not the picture. */
const Thumb = ({ hue = 210 }: { hue?: number }) => (
  // slice, not the default meet: an inline SVG letterboxes where a raster
  // image would crop, and object-fit does not apply to it. Without this the
  // demo misrepresents how a real <img> fills the card's reserved box.
  <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice"
       role="img" aria-label="Planet thumbnail">
    <defs>
      <radialGradient id={`g${hue}`} cx="30%" cy="25%">
        <stop offset="0%" stopColor={`hsl(${hue} 90% 62%)`} />
        <stop offset="100%" stopColor={`hsl(${hue + 30} 70% 12%)`} />
      </radialGradient>
    </defs>
    <rect width="320" height="200" fill={`hsl(${hue + 20} 60% 8%)`} />
    <circle cx="160" cy="118" r="74" fill={`url(#g${hue})`} />
    <ellipse cx="160" cy="118" rx="112" ry="26" fill="none"
             stroke={`hsl(${hue} 80% 70% / 0.55)`} strokeWidth="2" />
  </svg>
);

export const CardStory = () => (
  <Flex gap="4" wrap="wrap" align="start">
    <Card className="docs-card--demo">
      <Heading size="4">Kepler-442b</Heading>
      <Text color="muted" size="2">A temperate super-earth, 1,200 ly away.</Text>
    </Card>

    <Card image={<Thumb />} className="docs-card--demo">
      <Heading size="4">Kepler-442b</Heading>
      <Text color="muted" size="2">A temperate super-earth, 1,200 ly away.</Text>
    </Card>

    {/* A different crop, set in a stylesheet rather than inline — the token
        is the interface, and a style attribute in an example teaches the
        wrong habit. */}
    <Card image={<Thumb hue={280} />} className="docs-card--wide">
      <Heading size="4">TRAPPIST-1e</Heading>
      <Text color="muted" size="2">A wide crop, from a class.</Text>
    </Card>
  </Flex>
);
CardStory.storyName = "Card";
CardStory.meta = {
  description:
    "A translucent panel for grouping related content. Pass `image` for a media card: the card frames it full-bleed, matches its own corner radius, and reserves the box before the image loads so a row of cards never reflows as thumbnails arrive. The 12px inset is a deliberate exception to the spacing grid, kept for parity with the shipped app.",
};

export const FlexAndGrid = () => (
  <Flex direction="column" gap="4">
    <Flex gap="3">
      {[1, 2, 3].map((n) => (
        <Box key={n} style={{ background: "#22242c", padding: 16, borderRadius: 8 }}>
          <Text>Flex {n}</Text>
        </Box>
      ))}
    </Flex>
    <Grid columns="3" gap="3">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <Box key={n} style={{ background: "#1b2230", padding: 16, borderRadius: 8 }}>
          <Text>Grid {n}</Text>
        </Box>
      ))}
    </Grid>
  </Flex>
);

export const PaginationStory = () => {
  // What an API typically returns next to a page of results. The component
  // holds none of this — it reports the click, and the caller updates it.
  const [pagination, setPagination] = useState({ page: 1, pageSize: 120, totalItems: 2091 });
  const [short, setShort] = useState({ page: 2, pageSize: 10, totalItems: 48 });

  const from = (pagination.page - 1) * pagination.pageSize + 1;
  const to = Math.min(pagination.page * pagination.pageSize, pagination.totalItems);

  return (
    <div style={{ display: "grid", gap: 32 }}>
      <div style={{ display: "grid", gap: 12, justifyItems: "center" }}>
        <Text size="2" color="muted">
          Showing {from.toLocaleString()}–{to.toLocaleString()} of{" "}
          {pagination.totalItems.toLocaleString()} gas giants
        </Text>
        <Pagination
          pagination={pagination}
          onPageClick={(page) => setPagination((p) => ({ ...p, page }))}
        />
      </div>

      <div style={{ display: "grid", gap: 12, justifyItems: "center" }}>
        <Text size="2" color="muted">Few enough pages to show them all</Text>
        <Pagination
          pagination={short}
          onPageClick={(page) => setShort((p) => ({ ...p, page }))}
        />
      </div>
    </div>
  );
};
PaginationStory.storyName = "Pagination";
PaginationStory.meta = {
  components: ["Pagination"],
  description:
    "Page-by-page navigation for a long list. Give it the pagination object your API returns — page, page size and total items — and it reports which page was clicked through onPageClick; it holds no state of its own. The window stays the same width at every page, so the next click never lands on a different number than the last one did, and Previous and Next stay in place when they cannot be used. With one page or fewer it renders nothing.",
};
