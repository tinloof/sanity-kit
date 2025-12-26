import { Box, Card, Container, Tab, TabList, TabPanel } from "@sanity/ui";
import { useState } from "react";
import type { StorageAdapter } from "../adapters";
import { MediaPanel } from "./media-panel";
import { SettingsPanel } from "./settings-panel";

interface MediaToolProps {
  adapter: StorageAdapter;
}

export function MediaTool({ adapter }: MediaToolProps) {
  const isDevelopment =
    import.meta.env.DEV || import.meta.env.MODE === "development";
  const [activeTab, setActiveTab] = useState("media");

  // In production, just show the media panel without tabs
  if (!isDevelopment) {
    return (
      <Card height="fill" display="flex" style={{ flexDirection: "column" }}>
        <Box flex={1} overflow="auto">
          <Container width={5}>
            <MediaPanel adapter={adapter} />
          </Container>
        </Box>
      </Card>
    );
  }

  // In development, show tabs with media and settings
  return (
    <Card height="fill" display="flex" style={{ flexDirection: "column" }}>
      <Card borderBottom paddingX={4} paddingY={3}>
        <TabList space={1}>
          <Tab
            aria-controls="media-panel"
            id="media-tab"
            label="Media"
            selected={activeTab === "media"}
            onClick={() => setActiveTab("media")}
            fontSize={1}
            padding={3}
          />
          <Tab
            aria-controls="settings-panel"
            id="settings-tab"
            label="Settings"
            selected={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
            fontSize={1}
            padding={3}
          />
        </TabList>
      </Card>

      <Box flex={1} overflow="auto">
        <Container width={5}>
          <TabPanel
            aria-labelledby="media-tab"
            id="media-panel"
            hidden={activeTab !== "media"}
          >
            <MediaPanel adapter={adapter} />
          </TabPanel>

          <TabPanel
            aria-labelledby="settings-tab"
            id="settings-panel"
            hidden={activeTab !== "settings"}
          >
            <SettingsPanel adapter={adapter} />
          </TabPanel>
        </Container>
      </Box>
    </Card>
  );
}
