import { SpaceButton } from "@inkorange/space-ui";
import { SpaceLoader, IconToggle, Progress } from "@inkorange/space-ui";
import { useState } from "react";

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
