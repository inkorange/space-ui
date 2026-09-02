import { Loader, Message, Progress } from "@inkorange/space-ui";

export default {
  title: "Components/Feedback",
};

/* Loader and Progress used to sit under Buttons, which they never were. They
   report on work rather than start it — the same job a Message does. */

export const LoaderStory = () => <Loader label="Terraforming…" />;
LoaderStory.storyName = "Loader";
LoaderStory.meta = {
  description:
    "An indeterminate progress indicator for work with no measurable end. Pair it with a label that names the work, not the state.",
};

export const ProgressStory = () => (
  <div style={{ display: "grid", gap: 16, width: 320 }}>
    <Progress value={12} />
    <Progress value={45} />
    <Progress value={88} />
  </div>
);
ProgressStory.storyName = "Progress";
ProgressStory.meta = {
  description:
    "A determinate bar for work you can measure. Same visual language as Slider — a glass tube with a starlight fill — because a progress bar and a slider track are the same object, one you watch and one you drag. Height and fill are overridable through custom properties — see the table below.",
};

export const MessageStory = () => (
  <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
    <Message variant="info">
      Readings are averaged over the last ten orbits.
    </Message>

    <Message variant="warning" title="Thin atmosphere">
      Surface pressure is below 0.3 bar. Habitability scores above 60 are
      unlikely without an atmospheric rebuild.
    </Message>

    <Message variant="alert" title="Simulation failed">
      The mass you set exceeds the star&rsquo;s capture limit. Reduce it below
      12 Earth masses and run it again.
    </Message>

    <Message variant="info" icon={null}>
      No glyph, for a message that sits under a field it already belongs to.
    </Message>
  </div>
);
MessageStory.storyName = "Message";
MessageStory.meta = {
  components: ["Message"],
  description:
    "A banner about the state of the page \u2014 a risk, a result, a failure. The three variants do not merely change hue: info is lit like the rest of the system, warning warms the rim to amber, and alert takes the ember treatment the destructive Button wears. Each carries its own glyph so the kind of message reads before the words do. For a decision the reader has to make, reach for AlertDialog instead \u2014 a message states, it does not ask.",
};
