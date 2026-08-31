import { Text, Heading, Link, Separator, Badge } from "@inkorange/space-ui";

export default {
  title: "Components/Typography",
};

export const Headings = () => (
  <div style={{ display: "grid", gap: 12 }}>
    {(["9", "8", "7", "6", "5", "4", "3", "2", "1"] as const).map((s) => (
      <Heading key={s} size={s}>Heading size {s}</Heading>
    ))}
  </div>
);

export const TextSizes = () => (
  <div style={{ display: "grid", gap: 8 }}>
    {(["5", "4", "3", "2", "1"] as const).map((s) => (
      <Text key={s} size={s}>Text size {s} — the quick brown fox jumps over the lazy dog.</Text>
    ))}
    <Text color="gray">Gray text for secondary copy.</Text>
    <Link href="#">An inline link</Link>
  </div>
);

export const Badges = () => (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
    {(["gray", "blue", "green", "amber", "red"] as const).map((c) => (
      <Badge key={c} color={c}>{c}</Badge>
    ))}
    <Badge color="green" variant="soft">soft</Badge>
  </div>
);

export const SeparatorStory = () => (
  <div style={{ width: 320 }}>
    <Text>Above</Text>
    <Separator style={{ margin: "12px 0" }} />
    <Text>Below</Text>
  </div>
);
SeparatorStory.storyName = "Separator";
SeparatorStory.meta = {
  description:
    "A hairline rule using the border token, for dividing content without introducing a panel.",
};

Headings.meta = {
  description:
    "Nine heading sizes. Size is presentational and independent of heading level, so document structure stays correct.",
};

TextSizes.meta = {
  description:
    "Five body sizes plus the gray color role for secondary copy.",
};

Badges.meta = {
  description:
    "Compact status labels in five colors, solid and soft. Color carries meaning: green for safe, red for destructive, amber for pending.",
};
