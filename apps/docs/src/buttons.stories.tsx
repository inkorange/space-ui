import { SpaceButton, Text } from "@inkorange/space-ui";
import { SpaceLoader, IconToggle, Progress } from "@inkorange/space-ui";
import { useState } from "react";

export default {
  title: "Components/Buttons",
};

export const Buttons = () => {
  // Wired to real state so the story demonstrates that SpaceButton forwards
  // every standard button attribute — onClick included — rather than leaving
  // a reader to infer it from the prop table, which lists only its own props.
  const [builds, setBuilds] = useState(0);
  const count = () => setBuilds((n) => n + 1);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <SpaceButton onClick={count}>Build Planet</SpaceButton>
        <SpaceButton size="sm" onClick={count}>Small</SpaceButton>
        <SpaceButton size="lg" onClick={count}>Large</SpaceButton>
        {/* micro is sized for tiny steppers, so it only fits a glyph or two. */}
        <SpaceButton size="micro" onClick={count} aria-label="Micro">M</SpaceButton>
        <SpaceButton ember onClick={count}>Ember</SpaceButton>
        <SpaceButton iconOnly aria-label="Share" onClick={count}>↗</SpaceButton>
        <SpaceButton disabled onClick={count}>Disabled</SpaceButton>
      </div>

      <SpaceButton fullWidth onClick={count}>Full width</SpaceButton>

      <Text size="2" color="gray">
        {builds === 0
          ? "Click any button — disabled is wired up too, and correctly does nothing."
          : `${builds} ${builds === 1 ? "planet" : "planets"} built.`}
      </Text>
    </div>
  );
};

export const Loader = () => <SpaceLoader label="Terraforming…" />;

export const ProgressStory = () => (
  <div style={{ display: "grid", gap: 12, width: 320 }}>
    <Progress value={30} />
    <Progress value={72} />
  </div>
);
ProgressStory.storyName = "Progress";
ProgressStory.meta = {
  description:
    "A determinate bar for work you can measure. The track uses the dedicated track token rather than the border token — a solid recess, not a hairline.",
};

export const IconToggleStory = () => {
  const [v, setV] = useState("a");
  return (
    <IconToggle
      value={v}
      onValueChange={setV}
      options={[
        { value: "a", label: "Planet", icon: <span>🪐</span> },
        { value: "b", label: "System", icon: <span>✦</span> },
        { value: "c", label: "Surface", icon: <span>⛰</span> },
      ]}
    />
  );
};
IconToggleStory.storyName = "IconToggle";
IconToggleStory.meta = {
  description:
    "A single-select group for switching view or mode. Options carry both an icon and a label; the label is what screen readers announce.",
};

Buttons.meta = {
  description:
    "The primary action control. Four sizes, the ember variant for destructive-ish actions, icon-only, disabled and full-width. Sizing is driven by the spacing scale, so buttons stay on the grid wherever they land.",
};

Loader.meta = {
  description:
    "An indeterminate progress indicator for work with no measurable end. Pair it with a label that names the work, not the state.",
};
