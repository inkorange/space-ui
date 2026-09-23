import { useState } from "react";
import {
  Badge,
  BookmarkIcon,
  Button,
  CheckIcon,
  BarList,
  Card,
  Carousel,
  Chart,
  Checkbox,
  CheckboxGroup,
  Heading,
  HeartIcon,
  IconToggle,
  Link,
  Loader,
  Message,
  Pagination,
  Popover,
  Progress,
  RadioGroup,
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
  const [types, setTypes] = useState<string[]>(["ocean"]);

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

        {/* A premier specimen, so it sits near the top of the image. Half a
            slide at the edge says "this scrolls" in a still picture. */}
        <Cell label="Carousel" full>
          <Carousel aria-label="Planets" perView={3.5} showPagination>
            {SHEET_PLANETS.map(([name, hue, badge, color]) => (
              <Card key={name} image={<PlanetThumb hue={hue} />} className="docs-sheet__slide">
                <div className="docs-demo__head">
                  <Heading size="5">{name}</Heading>
                  <Badge color={color}>{badge}</Badge>
                </div>
                <Text size="2" color="muted">Habitable zone</Text>
              </Card>
            ))}
          </Carousel>
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

        <Cell label="Checkbox">
          <CheckboxGroup value={types} onValueChange={setTypes} aria-label="World types">
            <CheckboxGroup.Item value="ocean">Ocean</CheckboxGroup.Item>
            <CheckboxGroup.Item value="ice">Ice</CheckboxGroup.Item>
          </CheckboxGroup>
          <Checkbox checked indeterminate onCheckedChange={() => {}}>Mixed</Checkbox>
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

        <Cell label="Tabs" wide fill>
          <Tabs value={tab} onValueChange={setTab}>
            <Tabs.List>
              <Tabs.Trigger value="mass">Mass</Tabs.Trigger>
              <Tabs.Trigger value="orbit">Orbit</Tabs.Trigger>
              <Tabs.Trigger value="star">Star</Tabs.Trigger>
            </Tabs.List>
            <div className="docs-sheet__tabspanel">
              <Tabs.Content value="mass">
                <Text size="2" color="muted">
                  1.34 Earth masses, 1.11 Earth radii.
                </Text>
              </Tabs.Content>
            </div>
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

        <Cell label="Card · image" wide>
          <Card image={<SheetThumb />} className="docs-sheet__mediacard">
            <div className="docs-demo__head">
              <Heading size="5">TRAPPIST-1e</Heading>
              <Badge color="cyan">Ocean</Badge>
            </div>
            <Text size="2" color="muted">
              The card reserves the image box before it loads.
            </Text>
          </Card>
        </Cell>

        {/* Shown open, so the sheet documents the panel and not just a button.
            defaultOpen leaves focus alone, so the sheet does not scroll to it. */}
        <Cell label="Popover" wide>
          <div className="docs-sheet__popoverstage">
            <Popover label="Filter planets" defaultOpen>
              <div className="docs-sheet__popoverbody">
                <Text size="2" weight="bold">Minimum mass</Text>
                <Text size="1" color="muted">40 Earth masses and above</Text>
              </div>
            </Popover>
          </div>
        </Cell>

        <Cell label="Pagination" wide fill>
          <Pagination pagination={{ page: 5, pageSize: 10, totalItems: 180 }} onPageClick={() => {}} />
        </Cell>

        <Cell label="Chart" wide fill>
          <Chart
            type="bar"
            height={168}
            categories={["Mon", "Tue", "Wed", "Thu"]}
            series={[{ name: "Worlds", data: [142, 168, 183, 96] }]}
            partialFrom={3}
            aria-label="Worlds built per day"
          />
        </Cell>

        <Cell label="BarList" wide fill>
          <BarList
            aria-label="Poll results"
            items={[
              { label: "Idea", value: 44 },
              { label: "Bug", value: 7 },
              { label: "Other", value: 7 },
            ]}
          />
        </Cell>

        <Cell label="Message" full>
          <Message variant="warning" title="Thin atmosphere">
            Surface pressure is below 0.3 bar.
          </Message>
        </Cell>
      </div>
    </div>
  );
};

/** Stands in for a photograph. slice, not the default meet: an inline SVG
 *  letterboxes where a raster image would crop. */
const SheetThumb = () => (
  <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <radialGradient id="sheetThumb" cx="32%" cy="26%">
        <stop offset="0%" stopColor="hsl(190 90% 62%)" />
        <stop offset="100%" stopColor="hsl(215 70% 12%)" />
      </radialGradient>
    </defs>
    <rect width="320" height="200" fill="hsl(220 60% 8%)" />
    <circle cx="160" cy="116" r="72" fill="url(#sheetThumb)" />
    <ellipse cx="160" cy="116" rx="110" ry="25" fill="none"
             stroke="hsl(195 80% 70% / 0.5)" strokeWidth="2" />
  </svg>
);

/** One labelled swatch. The label is the export name, so the sheet doubles as
 *  an index: see a component, know what to import. */
const Cell = ({
  label,
  children,
  wide,
  tall,
  fill,
  full,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
  tall?: boolean;
  /** Spans the whole sheet — for a component that is a full-width banner. */
  full?: boolean;
  /** Stage becomes a block so a full-width child (Progress, TextArea) gets
   *  the whole measure instead of collapsing inside the flex row. */
  fill?: boolean;
}) => (
  <div
    className="docs-sheet__cell"
    data-wide={wide || undefined}
    data-tall={tall || undefined}
    data-fill={fill || undefined}
    data-full={full || undefined}
  >
    <div className="docs-sheet__label">{label}</div>
    <div className="docs-sheet__stage">{children}</div>
  </div>
);

Stickersheet.meta = {
  description:
    "Every component at its default size in one frame, and the source of the sheet in the README. Nothing here is composed on top: this is what the package renders.",
  // Not a component page. There is no single API to tabulate, and the source
  // is a list of examples rather than an example of use — both would be noise
  // between a reader and the thing they came to look at.
  components: [],
  source: false,
};

const SHEET_PLANETS = [
  ["Kepler-442b", 210, "Temperate", "success"],
  ["TRAPPIST-1e", 280, "Ocean", "cyan"],
  ["Proxima b", 20, "Thin air", "warning"],
  ["Gliese 667 Cc", 160, "Temperate", "success"],
  ["Kepler-186f", 120, "Hostile", "danger"],
  ["K2-18b", 190, "Ocean", "cyan"],
] as const;

/** A planet per slide, each its own hue, so the row reads as a collection. */
const PlanetThumb = ({ hue }: { hue: number }) => (
  <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <radialGradient id={`sheetPlanet${hue}`} cx="30%" cy="25%">
        <stop offset="0%" stopColor={`hsl(${hue} 90% 62%)`} />
        <stop offset="100%" stopColor={`hsl(${hue + 30} 70% 12%)`} />
      </radialGradient>
    </defs>
    <rect width="320" height="200" fill={`hsl(${hue + 20} 60% 8%)`} />
    <circle cx="160" cy="118" r="74" fill={`url(#sheetPlanet${hue})`} />
    <ellipse cx="160" cy="118" rx="112" ry="26" fill="none"
             stroke={`hsl(${hue} 80% 70% / 0.55)`} strokeWidth="2" />
  </svg>
);
