import { SpaceButton } from "@inkorange/space-ui";
import { SpaceLoader, IconToggle, Progress } from "@inkorange/space-ui";
import { useState } from "react";

export default {
  title: "Components/Buttons",
};

export const Buttons = () => (
  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
    <SpaceButton>Build Planet</SpaceButton>
    <SpaceButton size="sm">Small</SpaceButton>
    <SpaceButton size="lg">Large</SpaceButton>
    <SpaceButton disabled>Disabled</SpaceButton>
    <SpaceButton fullWidth>Full width</SpaceButton>
  </div>
);

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
    "The primary action control, in three sizes plus disabled and full-width. Sizing is driven by the spacing scale, so buttons stay on the grid wherever they land.",
};

Loader.meta = {
  description:
    "An indeterminate progress indicator for work with no measurable end. Pair it with a label that names the work, not the state.",
};
