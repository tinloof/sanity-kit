import { Box, Card, Container } from "@sanity/ui";
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
  const [showSettings, setShowSettings] = useState(false);
  const { isSelectionMode, assetType, cancelSelection, selectAsset } =
    useMediaSelection();

  const handleSelect = (asset: MediaAsset) => {
    selectAsset(asset);
  };

  // Show settings panel
  if (showSettings && !isSelectionMode) {
    return (
      <Card height="fill" display="flex" style={{ flexDirection: "column" }}>
        <Container width={5} style={{ flex: 1 }}>
          <Box overflow="auto" style={{ height: "100%" }}>
            <SettingsPanel adapter={adapter} onBack={() => setShowSettings(false)} />
          </Box>
        </Container>
      </Card>
    );
  }

  // Show media panel
  return (
    <Card height="fill" display="flex" style={{ flexDirection: "column" }}>
      <Box style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <MediaPanel
          adapter={adapter}
          selectionMode={isSelectionMode}
          selectionAssetType={assetType}
          onSelect={isSelectionMode ? handleSelect : undefined}
          onCancelSelection={isSelectionMode ? cancelSelection : undefined}
          onOpenSettings={() => setShowSettings(true)}
        />
      </Box>
    </Card>
  );
}
