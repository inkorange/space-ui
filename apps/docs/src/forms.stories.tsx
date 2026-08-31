import { useState } from "react";
import { TextField, TextArea, Slider, Select, RadioGroup } from "@inkorange/space-ui";

export default {
  title: "Components/Forms",
};

const column = { display: "grid", gap: 12, width: 320 } as const;

const STAR_TYPES = ["O", "B", "A", "F", "G", "K", "M"];

export const TextFieldStory = () => (
  <div style={column}>
    <TextField.Root placeholder="Planet name…" />
    <TextField.Root defaultValue="Kepler-442b" />
    <TextField.Root disabled placeholder="Disabled" />
  </div>
);
TextFieldStory.storyName = "TextField";
TextFieldStory.meta = {
  description:
    "Single-line text entry, composed as a Root so it can host slots later without a breaking change. The lit glass is part of the component — there is nothing to opt into.",
};

export const TextAreaStory = () => (
  <TextArea placeholder="Describe this world…" style={{ width: 320 }} rows={4} />
);
TextAreaStory.storyName = "TextArea";
TextAreaStory.meta = {
  description:
    "Multi-line entry. Rows set the initial height; the control grows with the container's width.",
};

export const SliderStory = () => {
  const [v, setV] = useState([40]);
  return (
    <div style={{ width: 320 }}>
      <Slider value={v} onValueChange={setV} min={0} max={100} step={1} aria-label="Value" />
    </div>
  );
};
SliderStory.storyName = "Slider";
SliderStory.meta = {
  description:
    "A range control for continuous values. Takes and returns an array so it can support multiple thumbs without an API change. The track is a glass tube, the thumb a limb-lit planet.",
};

export const SelectStory = () => {
  const [v, setV] = useState("G");
  return (
    <Select.Root value={v} onValueChange={setV}>
      <Select.Trigger style={{ minWidth: 180 }} />
      <Select.Content>
        {STAR_TYPES.map((s) => (
          <Select.Item key={s} value={s}>
            {s}-type star
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
};
SelectStory.storyName = "Select";
SelectStory.meta = {
  description:
    "A single-choice menu for lists too long to show inline. The trigger renders the selected item's own content.",
};

/**
 * `animated` is the one motion switch. It stills the ambient loops — the
 * orbiting rim, the glint, the twinkling stars — and leaves the glass,
 * gradients and rim shading exactly as they are.
 */
export const Animation = () => {
  const [a, setA] = useState("G");
  const [b, setB] = useState("G");
  return (
    <div style={{ display: "grid", gap: 28, maxWidth: 420 }}>
      <div style={{ display: "grid", gap: 10 }}>
        <code style={{ fontSize: 12, opacity: 0.7 }}>animated (default)</code>
        <TextField.Root placeholder="Planet name…" />
        <Select.Root value={a} onValueChange={setA}>
          <Select.Trigger style={{ minWidth: 180 }} />
          <Select.Content>
            {STAR_TYPES.map((s) => (
              <Select.Item key={s} value={s}>{s}-type star</Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <code style={{ fontSize: 12, opacity: 0.7 }}>animated={"{false}"}</code>
        <TextField.Root animated={false} placeholder="Planet name…" />
        <Select.Root value={b} onValueChange={setB}>
          <Select.Trigger animated={false} style={{ minWidth: 180 }} />
          <Select.Content animated={false}>
            {STAR_TYPES.map((s) => (
              <Select.Item key={s} value={s}>{s}-type star</Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </div>
    </div>
  );
};
Animation.meta = {
  description:
    "The same controls with ambient motion stilled. Only the loops stop — the glass, gradients and rim shading are the component, not a layer. prefers-reduced-motion does this automatically.",
};

export const RadioGroupStory = () => {
  const [v, setV] = useState("public");
  return (
    <RadioGroup.Root value={v} onValueChange={setV}>
      <RadioGroup.Item value="public">Public</RadioGroup.Item>
      <RadioGroup.Item value="unlisted">Unlisted</RadioGroup.Item>
      <RadioGroup.Item value="private">Private</RadioGroup.Item>
    </RadioGroup.Root>
  );
};
RadioGroupStory.storyName = "RadioGroup";
RadioGroupStory.meta = {
  description:
    "A single-choice control for short lists where seeing every option at once matters more than saving space.",
};
