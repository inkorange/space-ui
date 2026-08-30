import { TextField, TextArea, Slider, Select, RadioGroup } from "@inkorange/space-ui";
import { useState } from "react";

export const TextFieldStory = () => (
  <div style={{ display: "grid", gap: 12, width: 320 }}>
    <TextField.Root placeholder="Planet name…" />
    <TextField.Root defaultValue="Kepler-442b" />
    <TextField.Root disabled placeholder="Disabled" />
  </div>
);
TextFieldStory.storyName = "TextField";

export const TextAreaStory = () => (
  <TextArea placeholder="Describe this world…" style={{ width: 320 }} rows={4} />
);
TextAreaStory.storyName = "TextArea";

export const SliderStory = () => {
  const [v, setV] = useState([40]);
  return (
    <div style={{ width: 320 }}>
      <Slider value={v} onValueChange={setV} min={0} max={100} step={1} />
    </div>
  );
};
SliderStory.storyName = "Slider";

export const SelectStory = () => {
  const [v, setV] = useState("G");
  return (
    <Select.Root value={v} onValueChange={setV}>
      <Select.Trigger style={{ minWidth: 180 }} />
      <Select.Content>
        {["O", "B", "A", "F", "G", "K", "M"].map((s) => (
          <Select.Item key={s} value={s}>{s}-type star</Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
};
SelectStory.storyName = "Select";

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
