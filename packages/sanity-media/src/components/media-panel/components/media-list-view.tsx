import { CheckmarkCircleIcon } from "@sanity/icons";
import { Box, Flex, Text } from "@sanity/ui";
import { formatDuration, formatFileSize } from "../../../utils";
import { ThumbnailCell } from "../../shared/thumbnail-cell";
import { TAG_COLORS, type MediaAsset, type Tag } from "../types";

export interface MediaListViewProps {
  media: MediaAsset[];
  tags: Tag[];
  selectionMode: boolean;
  selectionTarget: MediaAsset | null;
  selectedIds: Set<string>;
  onItemClick: (item: MediaAsset) => void;
  onToggleSelection: (id: string) => void;
}

export function MediaListView({
  media,
  tags,
  selectionMode,
  selectionTarget,
  selectedIds,
  onItemClick,
  onToggleSelection,
}: MediaListViewProps) {
  return (
    <>
      <style>
        {`
          .media-list-col-dimensions,
          .media-list-col-size,
          .media-list-col-date,
          .media-list-col-tags {
            display: none;
          }
          @media (min-width: 600px) {
            .media-list-col-dimensions,
            .media-list-col-tags {
              display: flex;
            }
          }
          @media (min-width: 768px) {
            .media-list-col-size,
            .media-list-col-date {
              display: block;
            }
          }
        `}
      </style>
      <Box>
        {media.map((item) => {
          const isSelected = selectionMode
            ? selectionTarget?._id === item._id
            : selectedIds.has(item._id);
          return (
            <Box
              key={item._id}
              paddingY={2}
              style={{
                cursor: "pointer",
                borderBottom: "1px solid var(--card-border-color)",
                background: isSelected
                  ? "var(--card-muted-bg-color)"
                  : "transparent",
              }}
              onClick={() => onItemClick(item)}
            >
              <Flex align="center" gap={3} paddingX={2}>
                <ThumbnailCell asset={item} />

                {/* Filename */}
                <Text
                  size={1}
                  textOverflow="ellipsis"
                  title={item.originalFilename || "Untitled"}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  {item.originalFilename || "Untitled"}
                </Text>

                {/* Tags */}
                <Flex
                  gap={1}
                  className="media-list-col-tags"
                  style={{ flexShrink: 0, maxWidth: "150px" }}
                >
                  {item.tags && item.tags.length > 0 && (
                    <>
                      {item.tags.slice(0, 2).map((tagRef) => {
                        const tag = tags.find((t) => t._id === tagRef._ref);
                        if (!tag) return null;
                        const colors = TAG_COLORS[tag.color] || TAG_COLORS.gray;
                        return (
                          <Box
                            key={tag._id}
                            style={{
                              background: colors.bg,
                              color: colors.text,
                              padding: "2px 6px",
                              borderRadius: "3px",
                              fontSize: "10px",
                              fontWeight: 500,
                              maxWidth: "60px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {tag.name}
                          </Box>
                        );
                      })}
                      {item.tags.length > 2 && (
                        <Box
                          style={{
                            background: "var(--card-muted-bg-color)",
                            padding: "2px 6px",
                            borderRadius: "3px",
                            fontSize: "10px",
                            fontWeight: 500,
                          }}
                        >
                          +{item.tags.length - 2}
                        </Box>
                      )}
                    </>
                  )}
                </Flex>

                {/* Dimensions */}
                <Text
                  size={0}
                  muted
                  className="media-list-col-dimensions"
                  style={{ flexShrink: 0, width: "100px" }}
                >
                  {item.mediaType === "image"
                    ? item.metadata?.dimensions
                      ? `${item.metadata.dimensions.width}×${item.metadata.dimensions.height}`
                      : "Image"
                    : item.metadata?.duration
                      ? formatDuration(item.metadata.duration)
                      : "Video"}
                </Text>

                {/* Size */}
                <Text
                  size={0}
                  muted
                  className="media-list-col-size"
                  style={{ flexShrink: 0, width: "70px", textAlign: "right" }}
                >
                  {item.size ? formatFileSize(item.size) : "—"}
                </Text>

                {/* Date */}
                <Text
                  size={0}
                  muted
                  className="media-list-col-date"
                  style={{ flexShrink: 0, width: "90px", textAlign: "right" }}
                >
                  {new Date(item._createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>

                {/* Checkbox */}
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelection(item._id);
                  }}
                  style={{
                    flexShrink: 0,
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  <Box
                    style={{
                      width: "14px",
                      height: "14px",
                      borderRadius: "3px",
                      border: isSelected
                        ? "none"
                        : "1.5px solid var(--card-border-color)",
                      background: isSelected
                        ? "var(--card-focus-ring-color)"
                        : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isSelected && (
                      <CheckmarkCircleIcon
                        style={{ color: "white", fontSize: 10 }}
                      />
                    )}
                  </Box>
                </Box>
              </Flex>
            </Box>
          );
        })}
      </Box>
    </>
  );
}
