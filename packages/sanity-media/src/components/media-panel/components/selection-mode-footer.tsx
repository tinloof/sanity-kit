import { Box, Button, Card, Flex, Text } from "@sanity/ui";
import type { MediaAsset } from "../types";

export interface SelectionModeFooterProps {
  selectedAsset: MediaAsset;
  sidebarOpen: boolean;
  onSelect: () => void;
}

export function SelectionModeFooter({
  selectedAsset,
  sidebarOpen,
  onSelect,
}: SelectionModeFooterProps) {
  const imageSrc =
    selectedAsset.mediaType === "image"
      ? selectedAsset.url
      : selectedAsset.thumbnail?.url;

  return (
    <Card
      padding={3}
      style={{
        position: "fixed",
        bottom: 0,
        left: sidebarOpen ? 280 : 0,
        right: 0,
        borderTop: "1px solid var(--card-border-color)",
        background: "var(--card-bg-color)",
        zIndex: 100,
      }}
    >
      <Flex align="center" justify="space-between" gap={3}>
        <Flex align="center" gap={2}>
          <Box
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "4px",
              overflow: "hidden",
              flexShrink: 0,
              background:
                selectedAsset.mediaType === "video"
                  ? "#000"
                  : "var(--card-border-color)",
            }}
          >
            {imageSrc && (
              <img
                src={imageSrc}
                alt={selectedAsset.originalFilename || "Selected media"}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            )}
          </Box>
          <Text size={1} textOverflow="ellipsis" style={{ maxWidth: "200px" }}>
            {selectedAsset.originalFilename || "Untitled"}
          </Text>
        </Flex>
        <Button text="Select" tone="primary" onClick={onSelect} fontSize={1} />
      </Flex>
    </Card>
  );
}
