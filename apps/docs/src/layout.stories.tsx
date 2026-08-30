import { Box, Flex, Grid, Card, ScrollArea, Text, Heading } from "@inkorange/space-ui";

export const CardStory = () => (
  <Card style={{ maxWidth: 360 }}>
    <Heading size="4">Kepler-442b</Heading>
    <Text color="gray" size="2">A temperate super-earth, 1,200 ly away.</Text>
  </Card>
);
CardStory.storyName = "Card";

export const FlexAndGrid = () => (
  <Flex direction="column" gap="4">
    <Flex gap="3">
      {[1, 2, 3].map((n) => (
        <Box key={n} style={{ background: "#22242c", padding: 16, borderRadius: 8 }}>
          <Text>Flex {n}</Text>
        </Box>
      ))}
    </Flex>
    <Grid columns="3" gap="3">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <Box key={n} style={{ background: "#1b2230", padding: 16, borderRadius: 8 }}>
          <Text>Grid {n}</Text>
        </Box>
      ))}
    </Grid>
  </Flex>
);

export const ScrollAreaStory = () => (
  <ScrollArea style={{ height: 160, width: 300 }}>
    <div style={{ padding: 12 }}>
      {Array.from({ length: 30 }, (_, i) => (
        <Text key={i} as="p" size="2">Row {i + 1}</Text>
      ))}
    </div>
  </ScrollArea>
);
ScrollAreaStory.storyName = "ScrollArea";
