import { useState } from "react";
import { Autocomplete, MagnifyingGlassIcon, RadioGroup, Select, Slider, Text, TextArea, TextField } from "@inkorange/space-ui";

export default {
  title: "Components/Forms",
};

const column = { display: "grid", gap: 12, width: 320 } as const;

const STAR_TYPES = ["O", "B", "A", "F", "G", "K", "M"];

export const TextFieldStory = () => (
  <div style={column}>
    <TextField placeholder="Planet name…" />
    <TextField defaultValue="Kepler-442b" />
    <TextField disabled placeholder="Disabled" />
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
      <Select value={v} onValueChange={setV}>
        {STAR_TYPES.map((s) => (
          <Select.Item key={s} value={s}>
            {s}-type star
          </Select.Item>
        ))}
      </Select>

      {/* The width behaviour only shows at the extremes: the trigger sizes to
          its widest option, so a long list is what the cap exists for. */}
      <div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
        <code style={{ fontSize: 12, opacity: 0.7 }}>
          long options — capped at --sp-select-trigger-max-width (20rem)
        </code>
        <Select value={capped} onValueChange={setCapped}>
          {LONG_OPTIONS.map((o) => (
            <Select.Item key={o.value} value={o.value}>
              {o.label}
            </Select.Item>
          ))}
        </Select>
      </div>

      <div style={{ display: "grid", gap: 8, justifyItems: "start" }} className="story-narrow-select">
        <code style={{ fontSize: 12, opacity: 0.7 }}>
          fixed 220px width — the label ellipsizes, the panel still wraps
        </code>
        <Select value={narrow} onValueChange={setNarrow}>
          {LONG_OPTIONS.map((o) => (
            <Select.Item key={o.value} value={o.value}>
              {o.label}
            </Select.Item>
          ))}
        </Select>
      </div>

      <div style={{ display: "grid", gap: 8, justifyItems: "start" }} className="story-wide-select">
        <code style={{ fontSize: 12, opacity: 0.7 }}>
          same options, cap raised to 34rem on an ancestor
        </code>
        <Select value={wide} onValueChange={setWide}>
          {LONG_OPTIONS.map((o) => (
            <Select.Item key={o.value} value={o.value}>
              {o.label}
            </Select.Item>
          ))}
        </Select>
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
    <RadioGroup value={v} onValueChange={setV}>
      <RadioGroup.Item value="public">Public</RadioGroup.Item>
      <RadioGroup.Item value="unlisted">Unlisted</RadioGroup.Item>
      <RadioGroup.Item value="private">Private</RadioGroup.Item>
    </RadioGroup>
  );
};
RadioGroupStory.storyName = "RadioGroup";
RadioGroupStory.meta = {
  description:
    "A single-choice control for short lists where seeing every option at once matters more than saving space.",
};

/** A small stand-in catalogue. The component never filters — this is the
 *  consumer's job, and doing it here shows where that line falls. */
const PLANETS = [
  ["trappist-1b", "TRAPPIST-1 b", "Lava World", 0],
  ["trappist-1c", "TRAPPIST-1 c", "Lava World", 0],
  ["trappist-1d", "TRAPPIST-1 d", "Rocky Terrestrial", 15],
  ["trappist-1e", "TRAPPIST-1 e", "Rocky Terrestrial", 15],
  ["trappist-1f", "TRAPPIST-1 f", "Rocky Terrestrial", 15],
  ["trappist-1g", "TRAPPIST-1 g", "Rocky Terrestrial", 30],
  ["trappist-1h", "TRAPPIST-1 h", "Rocky Terrestrial", 30],
  ["kepler-186f", "Kepler-186 f", "Rocky Terrestrial", 62],
  ["kepler-442b", "Kepler-442 b", "Super-Earth", 84],
  ["proxima-b", "Proxima Centauri b", "Rocky Terrestrial", 71],
] as const;

const MAX_RESULTS = 6;

export const AutocompleteStory = () => {
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState<string | null>(null);

  // Filtering, ranking and capping all live here, in the consumer. A prefix
  // match is almost always the one they meant.
  const needle = query.trim().toLowerCase();
  const matched =
    needle.length < 2
      ? []
      : PLANETS.filter(([, name]) => name.toLowerCase().includes(needle)).sort((a, b) => {
          const ap = a[1].toLowerCase().startsWith(needle) ? 0 : 1;
          const bp = b[1].toLowerCase().startsWith(needle) ? 0 : 1;
          return ap - bp || a[1].length - b[1].length;
        });

  return (
    <div style={{ maxWidth: 560 }}>
      <Autocomplete
        value={query}
        onValueChange={setQuery}
        onSelect={(value) => setChosen(value)}
        icon={<MagnifyingGlassIcon width={16} height={16} />}
        placeholder="Search planets — try TRAPPIST or Kepler"
        aria-label="Search planets by name"
        options={matched.slice(0, MAX_RESULTS).map(([slug, name, type, score]) => ({
          value: slug,
          label: name,
          meta: `${type} · ${score}/100`,
        }))}
        // Only once the query is worth answering — below two characters there
        // are no options and no message, so no panel appears at all.
        emptyMessage={needle.length >= 2 ? `Nothing matching “${query.trim()}”.` : undefined}
        footer={
          matched.length > MAX_RESULTS
            ? `Showing ${MAX_RESULTS} of ${matched.length} matches — keep typing to narrow it down.`
            : undefined
        }
      />
      <Text size="2" color="muted" mt="3">
        {chosen ? `Selected: ${chosen}` : "Nothing selected yet."}
      </Text>
    </div>
  );
};
AutocompleteStory.storyName = "Autocomplete";
AutocompleteStory.meta = {
  components: ["Autocomplete"],
  description:
    "A text field that offers matching rows as you type. It holds no data of its own — you hand it options, from memory or an API, filtered and ranked however your domain ranks things, and it owns the popover, the keyboard model and the aria wiring. Arrows move the highlight, Enter selects, Escape closes, and hovering moves the same highlight the keyboard uses so the two can never disagree about what Enter would do.",
};
