import { PlayIcon } from "@sanity/icons";
import { Box, Flex } from "@sanity/ui";
import { getAssetPreviewUrl } from "../../utils";
import type { MediaAsset } from "../media-panel/types";

/** Icon size as a ratio of thumbnail size */
const ICON_SIZE_RATIO = 0.4;

export interface ThumbnailCellProps {
  asset: MediaAsset;
  /** Size of the thumbnail in pixels */
  size?: number;
  /** Border radius in pixels */
  borderRadius?: number;
}

/**
 * Reusable thumbnail cell for displaying media asset previews.
 * Uses optimized preview URL with fallback to original.
 * These are decorative thumbnails - the filename is shown elsewhere in the UI.
 */
export function ThumbnailCell({
  asset,
  size = 36,
  borderRadius = 3,
}: ThumbnailCellProps) {
  const imageSrc = getAssetPreviewUrl(asset);

  return (
    <Box
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${borderRadius}px`,
        overflow: "hidden",
        flexShrink: 0,
        background:
          asset.mediaType === "video" ? "#000" : "var(--card-border-color)",
      }}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt="" // Decorative: filename shown elsewhere in the row
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <Flex
          align="center"
          justify="center"
          style={{ width: "100%", height: "100%" }}
        >
          <PlayIcon style={{ fontSize: size * ICON_SIZE_RATIO }} />
        </Flex>
      )}
    </Box>
  );
}
