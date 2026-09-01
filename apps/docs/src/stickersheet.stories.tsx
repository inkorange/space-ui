import { useState } from "react";
import {
  Badge,
  BookmarkIcon,
  Button,
  CheckIcon,
  Card,
  Heading,
  HeartIcon,
  IconToggle,
  Link,
  Loader,
  Progress,
  RadioGroup,
  ScrollArea,
  Select,
  Separator,
  Slider,
  MagnifyingGlassIcon,
  PersonIcon,
  PlusIcon,
  Tabs,
  Text,
  TextArea,
  TextField,
  TrashIcon,
  ChevronRightIcon,
} from "@inkorange/space-ui";

export default {
  title: "Overview",
};

/**
 * The whole catalogue in one frame — the sheet a designer pins up to see the
 * library at a glance, and the source of the stickersheet image in the README.
 *
 * Everything here is a live component at its default size with nothing
 * composed on top, so the image can never drift from what the package
 * actually renders. Regenerate it with:
 *
 *   pnpm docs                       # serve the gallery
 *   pnpm stickersheet               # shoot .github/assets/components.png
 */
export const Stickersheet = () => {
  const [star, setStar] = useState("G");
  const [view, setView] = useState("orbit");
  const [mass, setMass] = useState([62]);
  const [band, setBand] = useState("habitable");
  const [tab, setTab] = useState("mass");

  return (
    <div className="docs-sheet" data-stickersheet>
      <div className="docs-sheet__grid">
        <Cell label="Button">
          <Button>Build planet</Button>
          <Button ember>Abort</Button>
        </Cell>

        <Cell label="Badge">
          <Badge color="success">Temperate</Badge>
          <Badge color="warning">Thin air</Badge>
          <Badge color="danger">Hostile</Badge>
          <Badge color="cyan">Ocean</Badge>
        </Cell>

        <Cell label="Select">
          <Select value={star} onValueChange={setStar}>
            <Select.Item value="G">G-type star</Select.Item>
            <Select.Item value="K">K-type star</Select.Item>
            <Select.Item value="M">M-type star</Select.Item>
          </Select>
        </Cell>

        <Cell label="TextField">
          <TextField defaultValue="Kepler-442b" />
        </Cell>

        <Cell label="Slider">
          <Slider value={mass} onValueChange={setMass} min={0} max={100} step={1} />
        </Cell>

        <Cell label="Progress" fill>
          <Progress value={68} />
        </Cell>

        <Cell label="IconToggle">
          <IconToggle
            value={view}
            onValueChange={setView}
            options={[
              { value: "orbit", icon: <PersonIcon />, label: "Orbit" },
              { value: "surface", icon: <MagnifyingGlassIcon />, label: "Surface" },
              { value: "atmos", icon: <BookmarkIcon />, label: "Atmos" },
            ]}
          />
        </Cell>

        <Cell label="RadioGroup">
          <RadioGroup value={band} onValueChange={setBand}>
            <RadioGroup.Item value="habitable">Habitable</RadioGroup.Item>
            <RadioGroup.Item value="inner">Inner</RadioGroup.Item>
          </RadioGroup>
        </Cell>

        <Cell label="Loader">
          <Loader />
        </Cell>

        <Cell label="Tabs" wide>
          <Tabs value={tab} onValueChange={setTab}>
            <Tabs.List>
              <Tabs.Trigger value="mass">Mass</Tabs.Trigger>
              <Tabs.Trigger value="orbit">Orbit</Tabs.Trigger>
              <Tabs.Trigger value="star">Star</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="mass">
              <Text size="2" color="muted">
                1.34 Earth masses, 1.11 Earth radii.
              </Text>
            </Tabs.Content>
          </Tabs>
        </Cell>

        <Cell label="Icons">
          <PersonIcon />
          <MagnifyingGlassIcon />
          <BookmarkIcon />
          <CheckIcon />
          <HeartIcon />
          <PlusIcon />
          <TrashIcon />
          <ChevronRightIcon />
        </Cell>

        <Cell label="Text · Heading · Link" wide fill>
          <Heading size="5">Habitable zone</Heading>
          <Text size="2" color="muted">
            The orbital band where liquid water can persist —{" "}
            <Link href="#">read the survey</Link>.
          </Text>
          <Separator style={{ margin: "12px 0 0" }} />
        </Cell>

        <Cell label="TextArea" wide fill>
          <TextArea defaultValue="A super-earth in the habitable zone, 1,206 light years out." />
        </Cell>

        <Cell label="Card" wide>
          <Card style={{ padding: 20, width: "100%" }}>
            <div className="docs-demo__head">
              <Heading size="5">Kepler-442b</Heading>
              <Badge color="success">Temperate</Badge>
            </div>
            <Text size="2" color="muted">
              A super-earth in the habitable zone.
            </Text>
            <Separator style={{ margin: "16px 0" }} />
            <Button>Build planet</Button>
          </Card>
        </Cell>

        <Cell label="ScrollArea" wide fill>
          <ScrollArea style={{ maxHeight: 148 }}>
            {["Kepler-442b", "Kepler-186f", "TRAPPIST-1e", "Proxima b", "Gliese 667 Cc", "TOI-700 d"].map(
              (name) => (
                <div key={name} className="docs-sheet__row">
                  <Text size="2">{name}</Text>
                  <Badge color="cyan">candidate</Badge>
                </div>
              ),
            )}
          </ScrollArea>
        </Cell>
      </div>
    </div>
  );
};

/** One labelled swatch. The label is the export name, so the sheet doubles as
 *  an index: see a component, know what to import. */
const Cell = ({
  label,
  children,
  wide,
  tall,
  fill,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
  tall?: boolean;
  /** Stage becomes a block so a full-width child (Progress, TextArea) gets
   *  the whole measure instead of collapsing inside the flex row. */
  fill?: boolean;
}) => (
  <div
    className="docs-sheet__cell"
    data-wide={wide || undefined}
    data-tall={tall || undefined}
    data-fill={fill || undefined}
  >
    <div className="docs-sheet__label">{label}</div>
    <div className="docs-sheet__stage">{children}</div>
  </div>
);
