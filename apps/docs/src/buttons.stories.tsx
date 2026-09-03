import { Button, IconToggle } from "@inkorange/space-ui";
import { useState } from "react";

export default {
  title: "Components/Buttons",
};

export const Buttons = () => (
  <div style={{ display: "grid", gap: 16 }}>
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <Button>Build Planet</Button>
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
      <Button size="micro" aria-label="Micro">M</Button>
      <Button ember>Ember</Button>
      <Button iconOnly aria-label="Share">↗</Button>
      <Button disabled>Disabled</Button>
    </div>

    <Button fullWidth>Full width</Button>
  </div>
);

export const IconToggleStory = () => {
  const [across, setAcross] = useState("a");
  const [down, setDown] = useState("a");
  const options = [
    { value: "a", label: "Planet", icon: <span>🪐</span> },
    { value: "b", label: "System", icon: <span>✦</span> },
    { value: "c", label: "Surface", icon: <span>⛰</span> },
  ];
  return (
    <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
      <IconToggle value={across} onValueChange={setAcross} options={options} />
      <IconToggle
        value={down}
        onValueChange={setDown}
        options={options}
        orientation="vertical"
      />
    </div>
  );
};
IconToggleStory.storyName = "IconToggle";
IconToggleStory.meta = {
  description:
    "A single-select group for switching view or mode. Options carry both an icon and a label; the label is what screen readers announce and what the tooltip shows. `orientation=\"vertical\"` turns it into a rail for an edge where horizontal width is the scarce dimension — its tooltips move to the side, since below would land on the next option.",
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
