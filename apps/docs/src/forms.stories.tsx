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

const LONG_OPTIONS = [
  { value: "g", label: "G-type main-sequence star" },
  {
    value: "k",
    label: "K-type orange dwarf, long-lived and unusually stable",
  },
  {
    value: "m",
    label:
      "M-type red dwarf with frequent flare activity that can strip a planetary atmosphere",
  },
  { value: "o", label: "O-type blue supergiant" },
];

export const SelectStory = () => {
  const [v, setV] = useState("G");
  const [capped, setCapped] = useState("m");
  const [narrow, setNarrow] = useState("m");
  const [wide, setWide] = useState("m");

  return (
    <div style={{ display: "grid", gap: 28, justifyItems: "start", maxWidth: 560 }}>
      <Select.Root value={v} onValueChange={setV}>
        <Select.Trigger />
        <Select.Content>
          {STAR_TYPES.map((s) => (
            <Select.Item key={s} value={s}>
              {s}-type star
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>

      {/* The width behaviour only shows at the extremes: the trigger sizes to
          its widest option, so a long list is what the cap exists for. */}
      <div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
        <code style={{ fontSize: 12, opacity: 0.7 }}>
          long options — capped at --sp-select-trigger-max-width (20rem)
        </code>
        <Select.Root value={capped} onValueChange={setCapped}>
          <Select.Trigger />
          <Select.Content>
            {LONG_OPTIONS.map((o) => (
              <Select.Item key={o.value} value={o.value}>
                {o.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </div>

      <div style={{ display: "grid", gap: 8, justifyItems: "start" }} className="story-narrow-select">
        <code style={{ fontSize: 12, opacity: 0.7 }}>
          fixed 220px width — the label ellipsizes, the panel still wraps
        </code>
        <Select.Root value={narrow} onValueChange={setNarrow}>
          <Select.Trigger />
          <Select.Content>
            {LONG_OPTIONS.map((o) => (
              <Select.Item key={o.value} value={o.value}>
                {o.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </div>

      <div style={{ display: "grid", gap: 8, justifyItems: "start" }} className="story-wide-select">
        <code style={{ fontSize: 12, opacity: 0.7 }}>
          same options, cap raised to 34rem on an ancestor
        </code>
        <Select.Root value={wide} onValueChange={setWide}>
          <Select.Trigger />
          <Select.Content>
            {LONG_OPTIONS.map((o) => (
              <Select.Item key={o.value} value={o.value}>
                {o.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </div>
    </div>
  );
};
SelectStory.storyName = "Select";
SelectStory.meta = {
  description:
    "A single-choice menu for lists too long to show inline. The trigger sizes itself to its widest option, so it never changes width as you select — the cap is what stops a long label producing an absurd control. Past the cap the trigger ellipsizes while the panel wraps, so you can always read an option in full before choosing it.",
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
