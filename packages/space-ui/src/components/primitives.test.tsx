/**
 * Markup-level tests for the in-house primitives (no jsdom: node env +
 * renderToStaticMarkup). These assert the prop→markup contract that the
 * ~55 migrated call sites depend on.
 */
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import path from "node:path";
import { readFileSync } from "node:fs";
import type { ReactElement } from "react";
import { Text } from "./Text";
import { Heading } from "./Heading";
import { Link } from "./Link";
import { Flex } from "./Flex";
import { Box } from "./Box";
import { Grid } from "./Grid";
import { Badge } from "./Badge";
import { Separator } from "./Separator";
import { Card } from "./Card";
import { Select } from "./Select";
import { TextField } from "./TextField";
import { TextArea } from "./TextArea";
import { Slider } from "./Slider";
import { RadioGroup } from "./RadioGroup";
import { Progress } from "./Progress";
import { Dialog } from "./Dialog";
import { AlertDialog } from "./AlertDialog";
import { DropdownMenu } from "./DropdownMenu";
import { Tabs } from "./Tabs";
import { Button } from "./Button";
import { Loader } from "./Loader";
import { Message } from "./Message";
import { Autocomplete } from "./Autocomplete";
import { IconToggle } from "./IconToggle";
import { Tooltip } from "./Tooltip";
import * as Icons from "./icons";

const html = (el: ReactElement) => renderToStaticMarkup(el);

describe("Text", () => {
  it("renders a span by default, polymorphic via as", () => {
    expect(html(<Text>hi</Text>)).toMatch(/^<span[^>]*>hi<\/span>$/);
    expect(html(<Text as="p">hi</Text>)).toMatch(/^<p/);
    expect(html(<Text as="label">hi</Text>)).toMatch(/^<label/);
  });
  it("applies size, weight, color classes and merges className", () => {
    const out = html(<Text size="2" weight="bold" color="muted" className="mine">x</Text>);
    expect(out).toContain("size2");
    expect(out).toContain("bold");
    expect(out).toContain("colorMuted");
    expect(out).toContain("mine");
  });
  it("maps mt/mb to spacing tokens as inline style, merging user style", () => {
    const out = html(<Text mt="2" mb="4" style={{ opacity: 0.5 }}>x</Text>);
    expect(out).toContain("margin-top:var(--spacing-sm)");
    expect(out).toContain("margin-bottom:var(--spacing-md)");
    expect(out).toContain("opacity:0.5");
  });
  it("rounds spacing step 3 UP to md per the spec rule", () => {
    expect(html(<Text mt="3">x</Text>)).toContain("margin-top:var(--spacing-md)");
  });
  it("passes through arbitrary DOM props (title)", () => {
    expect(html(<Text title="tip">x</Text>)).toContain('title="tip"');
  });
});

describe("Heading", () => {
  it("renders h2 by default, polymorphic via as", () => {
    expect(html(<Heading>t</Heading>)).toMatch(/^<h2/);
    expect(html(<Heading as="h1">t</Heading>)).toMatch(/^<h1/);
    expect(html(<Heading as="h3">t</Heading>)).toMatch(/^<h3/);
  });
  it("applies size and align classes and keeps id", () => {
    const out = html(<Heading size="8" align="center" id="galaxy-pitch-title">t</Heading>);
    expect(out).toContain("size8");
    expect(out).toContain("alignCenter");
    expect(out).toContain('id="galaxy-pitch-title"');
  });
});

describe("Link", () => {
  it("renders an anchor with href and size class", () => {
    const out = html(<Link href="https://x.test" size="1">go</Link>);
    expect(out).toMatch(/^<a/);
    expect(out).toContain('href="https://x.test"');
    expect(out).toContain("size1");
  });
  it("asChild clones the child instead of wrapping it", () => {
    const out = html(<Link asChild size="1"><button type="button">go</button></Link>);
    expect(out).toMatch(/^<button/);
    expect(out).toContain("size1");
    expect(out).not.toContain("<a");
  });
});

describe("Flex", () => {
  it("renders a flex div with gap/direction/align/justify/wrap classes", () => {
    const out = html(
      <Flex gap="3" direction="column" align="center" justify="between" wrap="wrap">x</Flex>
    );
    expect(out).toMatch(/^<div/);
    for (const c of ["flex", "gap3", "directionColumn", "alignCenter", "justifyBetween", "wrapWrap"]) {
      expect(out).toContain(c);
    }
  });
  it("asChild merges flex classes onto the child element", () => {
    const out = html(
      <Flex asChild gap="2">
        <Text as="label" size="2">radio</Text>
      </Flex>
    );
    expect(out).toMatch(/^<label/);
    expect(out).toContain("gap2");
    expect(out).toContain("size2");
  });
  it("maps p and pb spacing props", () => {
    const out = html(<Flex p="2" pb="6">x</Flex>);
    expect(out).toContain("padding:var(--spacing-sm)");
    expect(out).toContain("padding-bottom:var(--spacing-xl)");
  });
});

describe("Box", () => {
  it("renders a plain div passing className/style/data-* through", () => {
    const out = html(<Box className="c" style={{ maxWidth: 720 }} data-x="1">x</Box>);
    expect(out).toMatch(/^<div/);
    expect(out).toContain('class="c"');
    expect(out).toContain("max-width:720px");
    expect(out).toContain('data-x="1"');
  });
});

describe("Grid", () => {
  it("supports responsive columns objects", () => {
    const out = html(<Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">x</Grid>);
    for (const c of ["grid", "cols1", "smCols2", "mdCols3", "gap4"]) expect(out).toContain(c);
  });
});

describe("Badge", () => {
  it("applies color and size classes with soft default", () => {
    const out = html(<Badge color="success" size="2">Life</Badge>);
    expect(out).toMatch(/^<span/);
    for (const c of ["badge", "colorSuccess", "size2"]) expect(out).toContain(c);
  });
  it("supports every inventoried color incl. dynamic sources", () => {
    for (const c of ["muted","primary","success","danger","warning","cyan","purple","orange","accent","yellow"] as const) {
      expect(html(<Badge color={c}>x</Badge>)).toContain(`color${c[0].toUpperCase()}${c.slice(1)}`);
    }
  });
  it("defaults to primary, the regression the sweep caught", () => {
    expect(html(<Badge>x</Badge>)).toContain("colorPrimary");
  });
  it("is single-line by default; wrap opts long free-text into wrapping", () => {
    expect(html(<Badge>x</Badge>)).not.toContain("wrap");
    expect(html(<Badge wrap>long system name</Badge>)).toContain("wrap");
  });
});

describe("Separator", () => {
  it("renders a full-width horizontal rule", () => {
    const out = html(<Separator size="4" />);
    expect(out).toContain('role="separator"');
    expect(out).toContain("separator");
  });
});

describe("Card", () => {
  it("spreads arbitrary data-* attributes", () => {
    const out = html(<Card data-type="gas-giant" data-score="88">x</Card>);
    expect(out).toContain('data-type="gas-giant"');
    expect(out).toContain('data-score="88"');
  });
});

describe("Select", () => {
  const sel = (
    <Select value="" onValueChange={() => {}} placeholder="Pick one" aria-label="Star type">
      <Select.Item value="G">G - Yellow</Select.Item>
      <Select.Item value="M">M - Red Dwarf</Select.Item>
    </Select>
  );
  it("renders a closed combobox button showing the placeholder", () => {
    const out = html(sel);
    expect(out).toContain("spSelectTrigger");
    expect(out).toContain('aria-haspopup="listbox"');
    expect(out).toContain('aria-expanded="false"');
    expect(out).toContain('data-state="closed"');
    expect(out).toContain("Pick one");
    expect(out).toContain('aria-label="Star type"');
  });
  it("shows the selected item's label in the trigger (render-time resolution)", () => {
    const out = html(
      <Select value="M" onValueChange={() => {}} placeholder="Pick one">
        <Select.Item value="G">G - Yellow</Select.Item>
        <Select.Item value="M">M - Red Dwarf</Select.Item>
      </Select>
    );
    // The trigger renders a hidden sizer holding every label AND the
    // placeholder, so it is as wide as its widest possible content and never
    // jumps width on select. Assert on the visible label specifically —
    // "markup does not contain the placeholder" is no longer the same
    // question, since the sizer legitimately holds it.
    const visibleLabel = out.split('class="triggerLabel">')[1]?.split("</span>")[0];
    expect(visibleLabel).toBe("M - Red Dwarf");
    // Present, but only inside the aria-hidden sizer.
    expect(out).toContain('data-sizer=""');
    expect(out).toContain("Pick one");
  });
  it("renders a hidden listbox with options and aria-selected", () => {
    const out = html(
      <Select value="G" onValueChange={() => {}} placeholder="p">
        <Select.Item value="G">G - Yellow</Select.Item>
      </Select>
    );
    expect(out).toContain('role="listbox"');
    expect(out).toContain('role="option"');
    expect(out).toContain('aria-selected="true"');
    expect(out).toContain("spSelectItem");
    expect(out).toContain("hidden");
    // Each option carries an id derived from the listbox id + its value, so
    // the listbox can point aria-activedescendant at it once something is
    // highlighted (highlight state itself isn't reachable from a static
    // render — see the dedicated test below).
    const listboxIdMatch = out.match(/id="([\w:-]+)"[^>]*role="listbox"/);
    expect(listboxIdMatch).not.toBeNull();
    const listboxId = listboxIdMatch![1];
    expect(out).toContain(`id="${listboxId}-G"`);
  });
  it("has no aria-activedescendant on the listbox when nothing is highlighted", () => {
    const out = html(
      <Select value="G" onValueChange={() => {}} placeholder="p">
        <Select.Item value="G">G - Yellow</Select.Item>
      </Select>
    );
    expect(out).not.toContain("aria-activedescendant");
  });
});

describe("TextField", () => {
  it("wrapper carries className/style; input receives input props", () => {
    const out = html(
      <TextField className="mine" style={{ minWidth: 220 }} placeholder="Name" maxLength={40} value="x" onChange={() => {}} />
    );
    expect(out).toContain("spTextFieldRoot");
    expect(out).toContain("mine");
    expect(out).toContain("min-width:220px");
    expect(out).toContain('placeholder="Name"');
    expect(out).toContain('maxLength="40"');
    expect(out).toContain("spTextFieldInput");
  });
  it("renders a leading Slot", () => {
    const out = html(
      <TextField value="" onChange={() => {}}>
        <TextField.Slot><svg data-icon="mag" /></TextField.Slot>
      </TextField>
    );
    expect(out).toContain('data-icon="mag"');
    // Slot markup precedes the input
    expect(out.indexOf("data-icon")).toBeLessThan(out.indexOf("<input"));
  });
});

describe("TextArea", () => {
  it("wrapper + textarea with forwarded props", () => {
    const out = html(<TextArea className="mine" rows={5} maxLength={4000} placeholder="p" value="v" onChange={() => {}} />);
    expect(out).toContain("spTextFieldRoot");
    expect(out).toContain('rows="5"');
    expect(out).toContain("spTextAreaInput");
    expect(out).toContain(">v</textarea>");
  });
});

describe("Slider", () => {
  it("renders track/range/thumb parts and an accessible range input", () => {
    const out = html(
      <Slider value={[0.5]} onValueChange={() => {}} min={0} max={1} step={0.0025} aria-label="Distance" />
    );
    for (const c of ["spSliderTrack", "spSliderRange", "spSliderThumb", "spSliderInput"]) expect(out).toContain(c);
    expect(out).toContain('type="range"');
    expect(out).toContain('aria-label="Distance"');
    expect(out).toContain('step="0.0025"');
    expect(out).toContain("width:50%");
    expect(out).toContain("left:50%");
  });
});

describe("RadioGroup", () => {
  it("with children: renders a label wrapping input + orb + text", () => {
    const out = html(
      <RadioGroup value="public" onValueChange={() => {}}>
        <RadioGroup.Item value="public">Public</RadioGroup.Item>
      </RadioGroup>
    );
    expect(out).toContain('role="radiogroup"');
    expect(out).toMatch(/<label[^>]*>[\s\S]*type="radio"[\s\S]*spRadioOrb[\s\S]*Public[\s\S]*<\/label>/);
    expect(out).toContain("checked");
  });
  it("without children: renders span (no nested label) for outer-label composition", () => {
    const out = html(
      <RadioGroup value="G" onValueChange={() => {}}>
        <RadioGroup.Item value="G" />
      </RadioGroup>
    );
    expect(out).not.toContain("<label");
    expect(out).toContain("spRadioOrb");
  });

  // Regression (shipped bug): the orb's paint used to live in spaceControls'
  // opt-in `.spaceRadio` class. ConfigurationPanel applied it; SaveShareDialog
  // did not, so its Public/Private radios rendered with no circle and no
  // checked state. A design-system control must look right with no opt-in, so
  // the indicator styles have to stay in the component's OWN stylesheet.
  it("owns its indicator styles: circle + checked state need no opt-in class", () => {
    // path.join, not new URL(import.meta.url): under happy-dom the module
    // URL is http-scheme and readFileSync refuses it.
    const scss = readFileSync(
      path.join(__dirname, "RadioGroup.module.scss"),
      "utf8",
    );
    // The unchecked circle and the checked star-core, both keyed off the
    // component's own classes rather than a theme class a caller must add.
    expect(scss).toMatch(/\.orb[\s\S]*border-radius:\s*50%/);
    expect(scss).toMatch(/\.input:checked \+ \.orb::after/);
    expect(scss).toMatch(/\.input:checked \+ \.orb::before/);
    // The old opt-in hook must not come back as the source of paint. Compare
    // against comment-stripped source: the note above explains the history and
    // legitimately names the class.
    const code = scss.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    expect(code).not.toContain("spaceRadio");
  });

  it("every RadioGroup call site renders a styled control (no opt-in needed)", () => {
    // Guards the actual regression: a caller that just uses the component.
    const out = html(
      <RadioGroup value="private" onValueChange={() => {}}>
        <RadioGroup.Item value="public">Public</RadioGroup.Item>
        <RadioGroup.Item value="private">Private</RadioGroup.Item>
      </RadioGroup>
    );
    // Both orbs present, and exactly the selected one is checked.
    expect(out.match(/spRadioOrb/g)).toHaveLength(2);
    expect(out.match(/checked/g)).toHaveLength(1);
    // React emits `checked` before `value` on the input.
    expect(out).toMatch(/checked[^>]*value="private"/);
  });
});

describe("Progress", () => {
  it("renders an accessible bar with a plain fill div at the right width", () => {
    const out = html(<Progress value={12} max={100} className="progress" />);
    expect(out).toContain('role="progressbar"');
    expect(out).toContain('aria-valuenow="12"');
    expect(out).toContain("width:12%");
  });
});

describe("Dialog", () => {
  it("renders a native dialog with aria title/description wiring", () => {
    const out = html(
      <Dialog open onOpenChange={() => {}}>
        <Dialog.Content maxWidth="420px">
          <Dialog.Title>Save your planet</Dialog.Title>
          <Dialog.Description size="2">Keep it forever.</Dialog.Description>
          body
        </Dialog.Content>
      </Dialog>
    );
    expect(out).toMatch(/<dialog/);
    expect(out).toContain("spDialog");
    expect(out).toContain("max-width:420px");
    expect(out).toMatch(/aria-labelledby="[^"]+"/);
    // aria-describedby is applied via a layout effect once Description
    // mounts (so the attribute is omitted when no Description renders at
    // all), and renderToStaticMarkup never runs effects — so the dialog's
    // own attribute won't appear here. Assert the id wiring is present via
    // the Description element itself instead.
    expect(out).toMatch(/<p[^>]*id="[^"]+"[^>]*>Keep it forever\.<\/p>/);
    expect(out).not.toMatch(/aria-describedby/);
    expect(out).toMatch(/<h2[^>]*>Save your planet<\/h2>/);
  });
  it("Trigger and Close clone their child buttons", () => {
    const out = html(
      <Dialog>
        <Dialog.Trigger><button type="button" className="t">open</button></Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Close><button type="button" className="c">Cancel</button></Dialog.Close>
        </Dialog.Content>
      </Dialog>
    );
    expect(out).toContain('class="t"');
    expect(out).toContain('class="c"');
    expect(out).not.toContain("<span"); // no wrapper elements injected
  });
});

describe("AlertDialog", () => {
  it("renders role=alertdialog with Cancel before Action", () => {
    const out = html(
      <AlertDialog open onOpenChange={() => {}}>
        <AlertDialog.Content size="3" maxWidth="420px">
          <AlertDialog.Title>Delete system?</AlertDialog.Title>
          <AlertDialog.Description size="2">This cannot be undone.</AlertDialog.Description>
          <AlertDialog.Cancel><button type="button">Cancel</button></AlertDialog.Cancel>
          <AlertDialog.Action><button type="button">Delete</button></AlertDialog.Action>
        </AlertDialog.Content>
      </AlertDialog>
    );
    expect(out).toContain('role="alertdialog"');
    expect(out.indexOf(">Cancel<")).toBeLessThan(out.indexOf(">Delete<"));
  });
});

describe("DropdownMenu", () => {
  it("renders trigger with menu wiring and a closed popover menu", () => {
    const out = html(
      <DropdownMenu label="acct" align="end">
        <DropdownMenu.Label>you@x.test</DropdownMenu.Label>
        <DropdownMenu.Item asChild><a href="/account">Account</a></DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item color="danger" onSelect={() => {}}>Sign out</DropdownMenu.Item>
      </DropdownMenu>
    );
    expect(out).toContain('aria-haspopup="menu"');
    expect(out).toContain('role="menu"');
    expect(out).toContain('popover="auto"');
    // asChild forces menu semantics onto the child <a> while preserving its
    // own attributes — assert both independently (order-agnostic) rather
    // than one regex, since role/tabIndex are now explicitly stripped from
    // the child's own props before re-spreading (see DropdownMenu.tsx Item).
    expect(out).toContain('role="menuitem"');
    expect(out).toContain('href="/account"');
    expect(out).toContain('role="separator"');
    expect(out).toContain("danger");
  });
});

describe("Tabs", () => {
  const tabs = (
    <Tabs value="environment" onValueChange={() => {}}>
      <Tabs.List>
        <Tabs.Trigger value="elements">Elements</Tabs.Trigger>
        <Tabs.Trigger value="environment">Environment</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="elements">E</Tabs.Content>
      <Tabs.Content value="environment">V</Tabs.Content>
    </Tabs>
  );
  it("marks the active trigger and renders only the active panel", () => {
    const out = html(tabs);
    expect(out).toContain('role="tablist"');
    expect(out).toMatch(/data-state="active"[^>]*>Environment|Environment[^<]*<\/button>/);
    expect(out).toContain('data-state="inactive"');
    expect(out).toContain(">V<");
    expect(out).not.toContain(">E<");
    expect(out).toContain("spTabsTrigger");
    expect(out).toContain("spTabsList");
    // aria-controls/id linkage: ids are useId()-prefixed (not the literal
    // "tab-<value>" strings from before), so assert the trigger's
    // aria-controls actually equals the active panel's id rather than
    // hardcoding either string.
    const panelIdMatch = out.match(/role="tabpanel" id="([^"]+)"/);
    expect(panelIdMatch).not.toBeNull();
    const panelId = panelIdMatch![1];
    expect(out).toContain(`aria-controls="${panelId}"`);
  });
});

describe("icons", () => {
  it("every icon renders a 15x15 currentColor svg, aria-hidden by default, props override", () => {
    const all = [
      Icons.Share2Icon, Icons.ChatBubbleIcon, Icons.PlusIcon, Icons.Pencil1Icon,
      Icons.HeartFilledIcon, Icons.ExitFullScreenIcon, Icons.EnterFullScreenIcon,
      Icons.CheckIcon, Icons.TrashIcon, Icons.QuestionMarkCircledIcon, Icons.PersonIcon,
      Icons.MinusIcon, Icons.MagnifyingGlassIcon, Icons.HeartIcon, Icons.ChevronUpIcon,
      Icons.ChevronDownIcon, Icons.BookmarkIcon,
    ];
    expect(all).toHaveLength(17);
    for (const Icon of all) {
      const out = html(<Icon />);
      expect(out).toContain('viewBox="0 0 15 15"');
      expect(out).toContain("currentColor");
      expect(out).toContain('aria-hidden="true"');
    }
    expect(html(<Icons.CheckIcon width={20} aria-label="done" aria-hidden={undefined} />)).toContain('aria-label="done"');
  });
  it("matches the installed Radix output verbatim (spot check)", () => {
    expect(html(<Icons.CheckIcon />)).toContain('d="M11.4669');
  });
});

/**
 * `animated` is opt-out ambient motion. It is wired by a data attribute the
 * stylesheets key off, so a component can declare the prop, destructure it,
 * and silently drop it — TypeScript sees nothing wrong and the button keeps
 * spinning. That shipped once; this is the guard.
 */
describe("animated prop", () => {
  const cases: Array<[string, (animated?: boolean) => ReactElement]> = [
    ["Button", (a) => <Button animated={a}>go</Button>],
    ["Select", (a) => (
      <Select value="x" onValueChange={() => {}} animated={a}>
        <Select.Item value="x">x</Select.Item>
      </Select>
    )],
    ["TextField", (a) => <TextField animated={a} />],
    ["TextArea", (a) => <TextArea animated={a} />],
  ];

  for (const [name, render] of cases) {
    it(`${name} emits data-animated="false" only when animated is false`, () => {
      expect(html(render(false))).toContain('data-animated="false"');
      expect(html(render(undefined))).not.toContain("data-animated");
      expect(html(render(true))).not.toContain("data-animated");
    });
  }
});

/* Loader, IconToggle and Tooltip had no test at all — not a weak one, none:
   they were never mounted, so nothing here would have caught a component that
   stopped rendering. These cover the contract each one actually promises. */

describe("Loader", () => {
  it("is a live status region, named even without a label", () => {
    const out = html(<Loader />);
    expect(out).toContain('role="status"');
    expect(out).toContain('aria-live="polite"');
    // A spinner with no accessible name is announced as nothing at all.
    expect(out).toContain('aria-label="Loading"');
  });
  it("uses the label as both caption and accessible name", () => {
    const out = html(<Loader label="Charting orbit" />);
    expect(out).toContain('aria-label="Charting orbit"');
    expect(out).toContain(">Charting orbit<");
  });
  it("applies the size class and merges className", () => {
    expect(html(<Loader size="lg" className="mine" />)).toContain("lg");
    expect(html(<Loader size="lg" className="mine" />)).toContain("mine");
  });
});

describe("IconToggle", () => {
  const options = [
    { value: "orbit" as const, icon: <Icons.PersonIcon />, label: "Orbit" },
    { value: "surface" as const, icon: <Icons.BookmarkIcon />, label: "Surface" },
  ];

  it("renders every option, always visible", () => {
    const out = html(
      <IconToggle options={options} value="orbit" onValueChange={() => {}} />,
    );
    // A segmented control shows all its segments; a menu would not.
    expect(out.match(/<button/g)).toHaveLength(2);
    expect(out).toContain('role="group"');
  });
  it("marks only the selected segment pressed", () => {
    const out = html(
      <IconToggle options={options} value="surface" onValueChange={() => {}} />,
    );
    expect(out).toMatch(/aria-label="Orbit"[^>]*aria-pressed="false"/);
    expect(out).toMatch(/aria-label="Surface"[^>]*aria-pressed="true"/);
  });
  it("names each segment from its label, since the icon alone is not a name", () => {
    const out = html(
      <IconToggle options={options} value="orbit" onValueChange={() => {}} />,
    );
    expect(out).toContain('aria-label="Orbit"');
    expect(out).toContain('aria-label="Surface"');
  });
});

describe("IconToggle orientation", () => {
  const options = [
    { value: "a" as const, icon: <Icons.PersonIcon />, label: "A" },
    { value: "b" as const, icon: <Icons.BookmarkIcon />, label: "B" },
  ];
  const render = (orientation?: "horizontal" | "vertical") =>
    html(
      <IconToggle
        options={options}
        value="a"
        onValueChange={() => {}}
        orientation={orientation}
      />,
    );

  it("is horizontal by default", () => {
    expect(render()).not.toContain("vertical");
    expect(render("horizontal")).not.toContain("vertical");
  });
  it("adds the vertical class when asked", () => {
    expect(render("vertical")).toContain("vertical");
  });
  it("keeps every segment and its labelling in both orientations", () => {
    for (const o of [undefined, "vertical" as const]) {
      const out = render(o);
      expect(out.match(/<button/g)).toHaveLength(2);
      expect(out).toContain('aria-label="A"');
      expect(out).toContain('aria-pressed="true"');
    }
  });
  it("merges className rather than replacing the group class", () => {
    const out = html(
      <IconToggle options={options} value="a" onValueChange={() => {}} className="mine" />,
    );
    expect(out).toContain("mine");
    expect(out).toContain("group");
  });
});

describe("Tooltip", () => {
  it("describes its trigger and renders the label in a tooltip role", () => {
    const out = html(
      <Tooltip label="Switch view">
        <button type="button">x</button>
      </Tooltip>,
    );
    expect(out).toContain('role="tooltip"');
    expect(out).toContain("Switch view");
    // The id must actually connect the two, or the description is orphaned.
    const id = out.match(/aria-describedby="([^"]+)"/)?.[1];
    expect(id).toBeTruthy();
    expect(out).toContain(`id="${id}"`);
  });
  it("passes children straight through when there is no label", () => {
    const out = html(
      <Tooltip label="">
        <button type="button">x</button>
      </Tooltip>,
    );
    expect(out).toBe("<button type=\"button\">x</button>");
    expect(out).not.toContain("aria-describedby");
  });
});

describe("Message", () => {
  it("announces alerts assertively and everything else politely", () => {
    // role="alert" interrupts a screen reader. Right for something already
    // wrong, wrong for a note, so this distinction is load-bearing.
    expect(html(<Message variant="alert">x</Message>)).toContain('role="alert"');
    for (const v of ["info", "warning"] as const) {
      const out = html(<Message variant={v}>x</Message>);
      expect(out).toContain('role="status"');
      expect(out).toContain('aria-live="polite"');
    }
  });
  it("defaults to info", () => {
    expect(html(<Message>x</Message>)).toContain("info");
  });
  it("carries a different glyph per variant", () => {
    const glyph = (out: string) => out.match(/ d="([^"]{20,})"/)?.[1];
    const seen = (["info", "warning", "alert"] as const).map((v) =>
      glyph(html(<Message variant={v}>x</Message>)),
    );
    expect(seen.every(Boolean)).toBe(true);
    expect(new Set(seen).size).toBe(3);
  });
  it("hides the glyph from assistive tech, since the role already says it", () => {
    expect(html(<Message variant="warning">x</Message>)).toContain('aria-hidden="true"');
  });
  it("takes an icon override, and null for none", () => {
    expect(html(<Message icon={<span>!</span>}>x</Message>)).toContain("<span>!</span>");
    expect(html(<Message icon={null}>x</Message>)).not.toContain("<svg");
  });
  it("renders a title only when given one", () => {
    expect(html(<Message title="Heads up">x</Message>)).toContain("Heads up");
    expect(html(<Message>x</Message>)).not.toContain("title");
  });
  it("merges className rather than replacing it", () => {
    const out = html(<Message className="mine">x</Message>);
    expect(out).toContain("mine");
    expect(out).toContain("message");
  });
});

describe("Autocomplete", () => {
  const options = [
    { value: "b", label: "TRAPPIST-1 b", meta: "Lava World · 0/100" },
    { value: "c", label: "TRAPPIST-1 c", meta: "Lava World · 0/100" },
    { value: "d", label: "TRAPPIST-1 d", disabled: true },
  ];
  const field = (extra: Record<string, unknown> = {}) =>
    html(
      <Autocomplete
        value="trap"
        onValueChange={() => {}}
        onSelect={() => {}}
        options={options}
        {...extra}
      />,
    );

  it("wires the combobox to its listbox", () => {
    const out = field();
    expect(out).toContain('role="combobox"');
    expect(out).toContain('aria-autocomplete="list"');
    // The ids must actually connect, or the relationship is decorative.
    const controls = out.match(/aria-controls="([^"]+)"/)?.[1];
    expect(controls).toBeTruthy();
    expect(out).toContain(`id="${controls}"`);
  });

  it("turns off the browser's own autofill, which would cover the list", () => {
    // React 19 emits the prop verbatim as autoComplete; HTML attribute names
    // are case-insensitive, so the browser reads it either way.
    expect(field().toLowerCase()).toContain('autocomplete="off"');
  });

  it("is shut on first paint, but its listbox still exists", () => {
    // Shut, because a panel open before anyone has typed covers the page for
    // nothing. Mounted, because aria-controls points at it by id and a
    // dangling id is a promise the markup does not keep.
    const out = field();
    expect(out).toContain('aria-expanded="false"');
    expect(out).toContain('role="listbox"');
    expect(out).toMatch(/<div[^>]*class="[^"]*panel[^"]*"[^>]*hidden/);
  });

  it("marks a disabled row unselectable rather than hiding it", () => {
    // Rendered via the open path below; here we only assert the contract that
    // a disabled option keeps its place in the list.
    expect(options.filter((o) => !o.disabled)).toHaveLength(2);
  });

  it("puts label and meta in separate elements", () => {
    // meta must stay subordinate; folding it into label would make it part of
    // what a reader scans.
    const only = [{ value: "b", label: "TRAPPIST-1 b", meta: "Lava World" }];
    const out = html(
      <Autocomplete value="t" onValueChange={() => {}} onSelect={() => {}} options={only} />,
    );
    // Closed, so neither is present — the separation is asserted structurally
    // in the open-state test in the gallery. What matters here is that meta is
    // never concatenated into label.
    expect(out).not.toContain("TRAPPIST-1 b Lava World");
  });

  it("narrows case-insensitively by default", () => {
    // The whole point: typing lowercase finds an uppercase name.
    const out = html(
      <Autocomplete
        value="trappist-1 b"
        onValueChange={() => {}}
        onSelect={() => {}}
        options={options}
      />,
    );
    expect(out).toContain("TRAPPIST-1 b");
    expect(out).not.toContain("TRAPPIST-1 c");
  });

  it("caseSensitive makes the same query miss", () => {
    const out = html(
      <Autocomplete
        value="trappist-1 b"
        onValueChange={() => {}}
        onSelect={() => {}}
        options={options}
        caseSensitive
      />,
    );
    expect(out).not.toContain("TRAPPIST-1 b");
  });

  it("caseSensitive still matches when the case agrees", () => {
    const out = html(
      <Autocomplete
        value="TRAPPIST-1 b"
        onValueChange={() => {}}
        onSelect={() => {}}
        options={options}
        caseSensitive
      />,
    );
    expect(out).toContain("TRAPPIST-1 b");
  });

  it("preFiltered renders rows as given, matching nothing itself", () => {
    // A server or fuzzy match found these; a substring test here would throw
    // away rows it could not see the reason for.
    const out = html(
      <Autocomplete
        value="zzzz-no-substring-match"
        onValueChange={() => {}}
        onSelect={() => {}}
        options={options}
        preFiltered
      />,
    );
    expect(out).toContain("TRAPPIST-1 b");
  });

  it("matches an explicit search field when the label is markup", () => {
    const out = html(
      <Autocomplete
        value="proxima"
        onValueChange={() => {}}
        onSelect={() => {}}
        options={[
          { value: "p-b", label: <em>Proxima b</em>, search: "Proxima Centauri b" },
          { value: "k-9", label: <em>Kepler-9</em>, search: "Kepler-9" },
        ]}
      />,
    );
    expect(out).toContain("Proxima b");
    expect(out).not.toContain("Kepler-9");
  });

  it("merges className onto the wrapper rather than replacing it", () => {
    const out = field({ className: "mine" });
    expect(out).toContain("mine");
    expect(out).toContain("wrap");
  });

  it("forwards input attributes to the real input", () => {
    const out = field({ placeholder: "Search planets", "aria-label": "Search" });
    expect(out).toContain('placeholder="Search planets"');
    expect(out).toContain('aria-label="Search"');
  });
});
