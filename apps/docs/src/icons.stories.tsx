import * as UI from "@inkorange/space-ui";
import { Text } from "@inkorange/space-ui";
import { iconNames } from "./system-facts";

export default {
  title: "Components/Icons",
};

// Every exported *Icon component, rendered in a labeled grid.
export const AllIcons = () => {
  // Filtered against the generated icon list, not a name suffix: Pencil and
  // Share are icons without the `Icon` suffix and were missing from this
  // gallery entirely.
  const icons = iconNames
    .map((name) => [name, (UI as Record<string, unknown>)[name]] as const)
    .filter(([, v]) => typeof v === "function");
  return (
    <div className="docs-iconsheet">
      {icons.map(([name, Icon]) => (
        <div key={name} className="docs-iconsheet__cell">
          {/* @ts-expect-error dynamic component */}
          <Icon width={24} height={24} />
          <Text size="1" color="muted">{name}</Text>
        </div>
      ))}
    </div>
  );
};

AllIcons.meta = {
  // Icons are plain SVG components with no prop surface worth tabulating.
  components: [],
  description:
    "Every icon the package exports, rendered from the live module. Icons inherit currentColor and take width and height as props.",
};
