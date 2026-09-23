import { useState } from "react";
import { BarList, Chart, PieChart, Text, IconToggle } from "@inkorange/space-ui";

export default {
  title: "Components/Charts",
};

/* Figures a reader can sanity-check: the four inner planets, then a year of
   readings. Invented numbers that look like nothing would make the charts
   harder to judge, not easier. */
const PLANETS = ["Mercury", "Venus", "Earth", "Mars"];
const MASS = [0.055, 0.815, 1, 0.107];
const RADIUS = [0.383, 0.949, 1, 0.532];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const OBSERVED = [14, 22, 31, 28, 44, 52, 61, 58];
const CONFIRMED = [4, 9, 12, 15, 19, 26, 30, 33];

export const BarChart = () => (
  <div style={{ display: "grid", gap: 32, maxWidth: 680 }}>
    <div>
      <Text size="1" color="muted" className="docs-caption">One series — no legend, since the title already names it</Text>
      <Chart
        type="bar"
        categories={PLANETS}
        series={[{ name: "Mass", data: MASS }]}
        aria-label="Mass of the inner planets, Earth = 1"
      />
    </div>

    <div>
      <Text size="1" color="muted" className="docs-caption">Two series, side by side</Text>
      <Chart
        type="bar"
        categories={PLANETS}
        series={[
          { name: "Mass", data: MASS },
          { name: "Radius", data: RADIUS },
        ]}
        aria-label="Mass and radius of the inner planets, Earth = 1"
      />
    </div>

    <div>
      <Text size="1" color="muted" className="docs-caption">
        Today is still being counted, so its bar is drawn unfinished
      </Text>
      <Chart
        type="bar"
        categories={["Sun", "Mon", "Tue", "Wed"]}
        series={[{ name: "Worlds built", data: [142, 168, 183, 30] }]}
        partialFrom={3}
        aria-label="Worlds built per day, with today still counting"
      />
    </div>

    <div>
      <Text size="1" color="muted" className="docs-caption">Stacked, where the total is the point</Text>
      <Chart
        type="bar"
        stacked
        categories={MONTHS}
        series={[
          { name: "Confirmed", data: CONFIRMED },
          { name: "Candidates", data: OBSERVED.map((v, i) => v - CONFIRMED[i]) },
        ]}
        aria-label="Confirmed planets and remaining candidates by month"
      />
    </div>
  </div>
);
BarChart.storyName = "Bar chart";
BarChart.meta = {
  components: ["Chart"],
  description:
    "Amounts compared across categories. Bars are measured from zero always — a bar chart that starts partway up turns a small difference into a large one. Two or more series sit side by side, or stack when the total is what matters. Hovering reads every series at that category. `partialFrom` hatches the categories still being counted — today's bar, mid-day — so a half-counted period is never read as a collapse; the tooltip and the table say \"so far\" as well.",
};

export const LineAndArea = () => {
  type ChartType = "line" | "area" | "bar";
  const [type, setType] = useState<ChartType>("line");
  return (
    <div style={{ display: "grid", gap: 32, maxWidth: 680 }}>
      <div>
        <Text size="1" color="muted" className="docs-caption">
          The same data, drawn three ways — `type` is just a prop
        </Text>
        <div style={{ marginBottom: 16 }}>
          <IconToggle
            value={type}
            onValueChange={(next) => setType(next as ChartType)}
            options={[
              { value: "line", icon: <span aria-hidden>╱</span>, label: "Line" },
              { value: "area", icon: <span aria-hidden>◤</span>, label: "Area" },
              { value: "bar", icon: <span aria-hidden>▍</span>, label: "Bar" },
            ]}
          />
        </div>
        <Chart
          type={type}
          categories={MONTHS}
          series={[
            { name: "Observed", data: OBSERVED },
            { name: "Confirmed", data: CONFIRMED },
          ]}
          aria-label="Planets observed and confirmed by month"
        />
      </div>

      <div>
        <Text size="1" color="muted" className="docs-caption">
          A gap in the data is drawn as a gap, not as zero
        </Text>
        <Chart
          type="line"
          categories={MONTHS}
          series={[{ name: "Observed", data: [14, 22, null, null, 44, 52, 61, 58] }]}
          aria-label="Planets observed by month, with two months missing"
        />
      </div>
    </div>
  );
};
LineAndArea.storyName = "Line and area";
LineAndArea.meta = {
  components: ["Chart"],
  description:
    "A trend over time. `type` switches between line, area and bar on the same data, so a chart can offer the choice. A `null` reading is a gap in the line rather than a drop to zero, which would be a different claim. Area fills sit low enough that two overlapping series both stay readable.",
};

export const Rows = () => {
  const [chosen, setChosen] = useState<string | null>(null);
  return (
    <div style={{ display: "grid", gap: 32, maxWidth: 560 }}>
      <div>
        <Text size="1" color="muted" className="docs-caption">Poll results — one colour, read against the longest</Text>
        <BarList
          aria-label="What are you reporting?"
          items={[
            { label: "Idea", value: 44 },
            { label: "Bug", value: 7 },
            { label: "Other", value: 7 },
            { label: "Pain", value: 4 },
          ]}
        />
      </div>

      <div>
        <Text size="1" color="muted" className="docs-caption">Shares of a total, with each row its own colour</Text>
        <BarList
          colorful
          showPercent
          aria-label="Worlds by type"
          items={[
            { label: "Rocky", value: 128 },
            { label: "Gas giant", value: 96 },
            { label: "Ice giant", value: 41 },
            { label: "Lava", value: 22 },
          ]}
          onItemClick={(item) => setChosen(item.label)}
        />
        <Text size="1" color="muted">
          {chosen ? `You chose ${chosen}` : "Rows are buttons when onItemClick is given, and plain text when it is not"}
        </Text>
      </div>
    </div>
  );
};
Rows.storyName = "Bar list";
Rows.meta = {
  components: ["BarList"],
  description:
    "A ranked list of values: label, track, bar, figure. The form to reach for when the categories are words rather than dates — they keep a column of their own instead of being turned on their side. Every bar is drawn against the longest, or against `max` when the share of a known total is the point.",
};

export const Pie = () => (
  <div style={{ display: "grid", gap: 32, maxWidth: 560 }}>
    <div>
      <Text size="1" color="muted" className="docs-caption">A donut puts the total where it can be read exactly</Text>
      <PieChart
        donut
        label="worlds"
        aria-label="Worlds by type"
        slices={[
          { label: "Rocky", value: 128 },
          { label: "Gas giant", value: 96 },
          { label: "Ice giant", value: 41 },
          { label: "Lava", value: 22 },
        ]}
      />
    </div>

    <div>
      <Text size="1" color="muted" className="docs-caption">Filled, for three or four parts of one whole</Text>
      <PieChart
        aria-label="Atmosphere by volume"
        slices={[
          { label: "Nitrogen", value: 78 },
          { label: "Oxygen", value: 21 },
          { label: "Argon", value: 1 },
        ]}
      />
    </div>
  </div>
);
Pie.storyName = "Pie chart";
Pie.meta = {
  components: ["PieChart"],
  description:
    "Parts of a whole. Worth knowing before reaching for it: people read angles badly, so a pie is the weakest way to compare sizes and the wrong chart for more than a handful of slices, for values that are not parts of one total, or for change over time. Where it earns its place is a whole that splits a few ways. The legend always carries the names and figures, so nothing depends on telling two colours apart.",
};
