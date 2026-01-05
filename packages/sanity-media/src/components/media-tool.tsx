import { Box, Card, Container, Tab, TabList } from "@sanity/ui";
import { useState } from "react";
import type { StorageAdapter } from "../adapters";
import { useMediaSelection } from "../context/selection-context";
import { MediaPanel } from "./media-panel";
import type { MediaAsset } from "./media-panel/types";
import { SettingsPanel } from "./settings-panel";

interface MediaToolProps {
  adapter: StorageAdapter;
}

export function MediaTool({ adapter }: MediaToolProps) {
  const isDevelopment =
    import.meta.env.DEV || import.meta.env.MODE === "development";
  const [activeTab, setActiveTab] = useState("media");
  const { isSelectionMode, assetType, cancelSelection, selectAsset } =
    useMediaSelection();

  const handleSelect = (asset: MediaAsset) => {
    selectAsset(asset);
  };

  // In production or selection mode, just show the media panel without tabs
  if (!isDevelopment || isSelectionMode) {
    return (
      <Card height="fill" display="flex" style={{ flexDirection: "column" }}>
        <Box style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <MediaPanel
            adapter={adapter}
            selectionMode={isSelectionMode}
            selectionAssetType={assetType}
            onSelect={isSelectionMode ? handleSelect : undefined}
            onCancelSelection={isSelectionMode ? cancelSelection : undefined}
          />
        </Box>
      </Card>
    );
  }

  // In development (non-selection mode), show tabs with media and settings
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

      <Box style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {activeTab === "media" ? (
          <MediaPanel adapter={adapter} />
        ) : (
          <Container width={5}>
            <Box overflow="auto" paddingY={4}>
              <SettingsPanel adapter={adapter} />
            </Box>
          </Container>
        )}
      </Box>
    </Card>
  );
}
