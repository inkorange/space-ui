import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Heading,
  Loader,
  Message,
  Pagination,
  Progress,
  RadioGroup,
  Select,
  Slider,
  Tabs,
  Text,
  TextField,
} from "@inkorange/space-ui";

/**
 * A small working application, used wherever a palette has to be judged.
 *
 * Deliberately a mix of the four ways the system uses light: a lit sphere
 * (the Slider thumb), a lit plate (the Checkbox), a solid accent fill (the
 * Badge) and glass with a rim (the Card and Buttons). A palette that breaks
 * one of them shows it here rather than three pages later.
 *
 * Its state is local, so several can sit side by side without a drag in one
 * moving the others.
 */
export const Specimen = ({ lit = true }: { lit?: boolean }) => {
  const [mass, setMass] = useState([62]);
  const [held, setHeld] = useState(lit);

  return (
    <Card className="docs-palette__specimen">
      <Heading as="h4" size="4">
        Orbital insertion
      </Heading>
      <Text size="2" color="muted">
        Burn duration scales with approach mass.
      </Text>
      <div className="docs-palette__badges">
        <Badge color="primary">Primary</Badge>
        <Badge color="success">Nominal</Badge>
        <Badge color="muted">Idle</Badge>
      </div>
      <Slider value={mass} onValueChange={setMass} min={0} max={100} aria-label="Approach mass" />
      <Checkbox checked={held} onCheckedChange={setHeld}>
        Hold at periapsis
      </Checkbox>
      <div className="docs-palette__actions">
        <Button size="sm">Commit burn</Button>
        <Button size="sm" ember>
          Abort
        </Button>
      </div>
    </Card>
  );
};

/**
 * The validation suite: enough of the library that a change to any control on
 * the generator reaches something visibly.
 *
 * Grouped by what each group proves. Spacing shows in the gaps between rows
 * and inside the controls; radius in the corners of panels, fields and the
 * tab strip, and in the two shapes that must NOT follow it — the pill of a
 * Progress track and the circle of a Loader moon. Colour shows everywhere,
 * except in the three places a palette is not allowed to touch, which is why
 * the status Messages and the categorical Badges are here.
 *
 * Everything is controlled and local, so it stays live under the controls
 * without the page holding any of its state.
 */
export const SpecimenSuite = () => {
  const [tab, setTab] = useState("burn");
  const [craft, setCraft] = useState("voyager");
  const [band, setBand] = useState("x");
  const [range, setRange] = useState([30, 70]);
  const [checked, setChecked] = useState(true);
  const [page, setPage] = useState(3);

  return (
    <div className="docs-suite">
      <section className="docs-suite__group">
        <span className="docs-suite__label">Surfaces · radius lg, xl</span>
        <Card>
          <Heading as="h4" size="4">
            Transfer window
          </Heading>
          <Text size="2" color="muted">
            The corners of this card, the tab strip and the menus are all steps
            off one base.
          </Text>
        </Card>
        <Tabs value={tab} onValueChange={setTab}>
          <Tabs.List>
            <Tabs.Trigger value="burn">Burn</Tabs.Trigger>
            <Tabs.Trigger value="coast">Coast</Tabs.Trigger>
            <Tabs.Trigger value="entry">Entry</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="burn">
            <Text size="2">Ignition at T−40s.</Text>
          </Tabs.Content>
          <Tabs.Content value="coast">
            <Text size="2">Ballistic for 11 minutes.</Text>
          </Tabs.Content>
          <Tabs.Content value="entry">
            <Text size="2">Interface at 120km.</Text>
          </Tabs.Content>
        </Tabs>
      </section>

      <section className="docs-suite__group">
        <span className="docs-suite__label">Controls · the height ladder</span>
        <div className="docs-suite__row">
          <Button size="sm">Small</Button>
          <Button>Medium</Button>
          <Button size="lg">Large</Button>
          <Button ember>Abort</Button>
        </div>
        <div className="docs-suite__row">
          <TextField placeholder="Callsign" aria-label="Callsign" />
          <Select value={craft} onValueChange={setCraft} aria-label="Craft">
            <Select.Item value="voyager">Voyager</Select.Item>
            <Select.Item value="cassini">Cassini</Select.Item>
            <Select.Item value="juno">Juno</Select.Item>
          </Select>
        </div>
      </section>

      <section className="docs-suite__group">
        <span className="docs-suite__label">Lit shapes · spheres, plates, pills</span>
        <Slider value={range} onValueChange={setRange} min={0} max={100} aria-label="Window" />
        <Progress value={64} />
        <div className="docs-suite__row">
          <Checkbox checked={checked} onCheckedChange={setChecked}>
            Hold at periapsis
          </Checkbox>
          <Loader size="sm" label="Computing" />
        </div>
        <RadioGroup value={band} onValueChange={setBand}>
          <RadioGroup.Item value="s">S-band</RadioGroup.Item>
          <RadioGroup.Item value="x">X-band</RadioGroup.Item>
        </RadioGroup>
      </section>

      <section className="docs-suite__group">
        <span className="docs-suite__label">
          Off-limits to a palette · status and categorical
        </span>
        <Message variant="info" title="Telemetry nominal">
          Info follows the accent, because it is the system speaking.
        </Message>
        <Message variant="warning" title="Window closing">
          Warning does not. It means something a brand hue must not redefine.
        </Message>
        <div className="docs-suite__row">
          <Badge color="primary">Primary</Badge>
          <Badge color="success">Success</Badge>
          <Badge color="warning">Warning</Badge>
          <Badge color="danger">Danger</Badge>
          <Badge color="cyan">Cyan</Badge>
          <Badge color="purple">Purple</Badge>
        </div>
      </section>

      <section className="docs-suite__group">
        <span className="docs-suite__label">Chrome · spacing between every part</span>
        <Pagination
          pagination={{ page, pageSize: 10, totalItems: 84 }}
          onPageClick={setPage}
        />
      </section>
    </div>
  );
};
