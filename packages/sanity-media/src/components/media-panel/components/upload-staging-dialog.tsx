import {
  CheckmarkIcon,
  ChevronDownIcon,
  CloseIcon,
  ErrorOutlineIcon,
  ImageIcon,
  PlayIcon,
  TagIcon,
  TrashIcon,
  UploadIcon,
} from "@sanity/icons";
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  Spinner,
  Stack,
  Text,
  TextArea,
  TextInput,
} from "@sanity/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { styled } from "styled-components";
import { formatFileSize } from "../../../utils";
import { TAG_COLORS, type StagingItem, type Tag } from "../types";

const FileCard = styled(Card)<{ $focused?: boolean }>`
  &:hover .delete-button {
    opacity: 1;
  }

  ${(props) =>
    props.$focused &&
    `
    box-shadow: 0 0 0 2px var(--card-focus-ring-color);
  `}
`;

const DeleteButton = styled(Button)`
  opacity: 0;
  transition: opacity 0.15s ease;
`;

const Thumbnail = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--card-bg2-color);
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProgressBar = styled.div`
  height: 4px;
  background: var(--card-border-color);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
`;

const ProgressFill = styled.div<{ $progress: number; $status?: string }>`
  height: 100%;
  width: ${(props) => props.$progress}%;
  background: ${(props) =>
    props.$status === "complete"
      ? "var(--card-badge-positive-bg-color, #2ecc71)"
      : props.$status === "error"
      ? "var(--card-badge-critical-bg-color, #e74c3c)"
      : "var(--card-focus-ring-color)"};
  transition: width 0.2s ease;
`;

export interface UploadStagingDialogProps {
  stagingItems: StagingItem[];
  tags: Tag[];
  onClose: () => void;
  onStartUpload: () => void;
  onUpdateItem: (id: string, updates: Partial<StagingItem>) => void;
  onRemoveItem: (id: string) => void;
  /** Whether upload is in progress */
  isUploading?: boolean;
}

function ItemThumbnail({ item }: { item: StagingItem }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <Thumbnail>
        <Text size={2} muted>
          {item.type === "image" ? <ImageIcon /> : <PlayIcon />}
        </Text>
      </Thumbnail>
    );
  }

  return (
    <Thumbnail>
      {item.type === "image" ? (
        <img src={item.previewUrl} alt="" onError={() => setError(true)} />
      ) : (
        <video src={item.previewUrl} onError={() => setError(true)} />
      )}
    </Thumbnail>
  );
}

export function UploadStagingDialog({
  stagingItems,
  tags,
  onClose,
  onStartUpload,
  onUpdateItem,
  onRemoveItem,
  isUploading = false,
}: UploadStagingDialogProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Calculate upload progress stats
  const uploadStats = useMemo(() => {
    const completed = stagingItems.filter(
      (item) => item.uploadStatus === "complete"
    ).length;
    const failed = stagingItems.filter(
      (item) => item.uploadStatus === "error"
    ).length;
    const total = stagingItems.length;
    const allDone = completed + failed === total && total > 0;
    return { completed, failed, total, allDone };
  }, [stagingItems]);

  // Count items missing alt text (images only)
  const missingAltCount = useMemo(() => {
    return stagingItems.filter(
      (item) => item.type === "image" && !item.alt?.trim()
    ).length;
  }, [stagingItems]);

  // Upload button text with validation nudge
  const uploadButtonText = useMemo(() => {
    if (missingAltCount > 0) {
      return `Upload (${missingAltCount} without alt text)`;
    }
    return "Upload";
  }, [missingAltCount]);

  // Keep focusedIndex in bounds when items are removed
  useEffect(() => {
    if (focusedIndex !== null && focusedIndex >= stagingItems.length) {
      setFocusedIndex(stagingItems.length > 0 ? stagingItems.length - 1 : null);
    }
  }, [stagingItems.length, focusedIndex]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't handle navigation keys when typing in an input
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if (e.key === "Escape") {
        // If in an input, blur it first; otherwise close dialog
        if (isInputFocused) {
          target.blur();
        } else {
          onClose();
        }
        return;
      }

      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onStartUpload();
        return;
      }

      // Navigation shortcuts - only when not in an input
      if (isInputFocused) return;

      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const newIndex =
            prev === null ? 0 : Math.min(prev + 1, stagingItems.length - 1);
          setTimeout(() => {
            const card = document.querySelector(
              `[data-staging-index="${newIndex}"]`
            );
            card?.scrollIntoView({ block: "nearest", behavior: "smooth" });
          }, 0);
          return newIndex;
        });
      }

      if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const newIndex =
            prev === null ? stagingItems.length - 1 : Math.max(prev - 1, 0);
          setTimeout(() => {
            const card = document.querySelector(
              `[data-staging-index="${newIndex}"]`
            );
            card?.scrollIntoView({ block: "nearest", behavior: "smooth" });
          }, 0);
          return newIndex;
        });
      }

      if ((e.key === "Enter" || e.key === " ") && focusedIndex !== null) {
        e.preventDefault();
        const item = stagingItems[focusedIndex];
        if (item) {
          const wasExpanded = item.expanded;
          onUpdateItem(item.id, { expanded: !item.expanded });
          // Auto-focus first input when expanding
          if (!wasExpanded) {
            setTimeout(() => {
              const card = document.querySelector(
                `[data-staging-index="${focusedIndex}"]`
              );
              const firstInput = card?.querySelector(
                "input, textarea"
              ) as HTMLElement;
              firstInput?.focus();
            }, 0);
          }
        }
      }

      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        focusedIndex !== null
      ) {
        e.preventDefault();
        const item = stagingItems[focusedIndex];
        if (item) {
          onRemoveItem(item.id);
        }
      }
    },
    [
      onClose,
      onStartUpload,
      stagingItems,
      focusedIndex,
      onUpdateItem,
      onRemoveItem,
    ]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const footer = (
    <Box
      padding={3}
      style={{ borderTop: "1px solid var(--card-border-color)" }}
    >
      <Flex gap={2} justify="flex-end" align="center">
        {isUploading && !uploadStats.allDone && (
          <Flex align="center" gap={2} style={{ marginRight: "auto" }}>
            <Spinner />
            <Text size={1} muted>
              Uploading {uploadStats.completed + 1} of {uploadStats.total}...
            </Text>
          </Flex>
        )}
        {uploadStats.allDone && (
          <Flex align="center" gap={2} style={{ marginRight: "auto" }}>
            <Text size={1} muted>
              {uploadStats.completed} uploaded
              {uploadStats.failed > 0 && `, ${uploadStats.failed} failed`}
            </Text>
          </Flex>
        )}
        {!uploadStats.allDone && (
          <>
            <Button
              text="Cancel"
              mode="ghost"
              onClick={onClose}
              disabled={isUploading}
            />
            <Button
              icon={UploadIcon}
              text={uploadButtonText}
              tone="primary"
              onClick={onStartUpload}
              disabled={isUploading}
            />
          </>
        )}
      </Flex>
    </Box>
  );

  return (
    <Dialog
      id="upload-staging-dialog"
      header={`Upload ${stagingItems.length} file${
        stagingItems.length > 1 ? "s" : ""
      }`}
      onClose={onClose}
      zOffset={1000}
      width={1}
      footer={footer}
    >
      <Box padding={4}>
        {/* File List */}
        <Stack space={2}>
          {stagingItems.map((item, index) => {
            const missingAlt = item.type === "image" && !item.alt?.trim();
            const missingTitle = item.type === "video" && !item.title?.trim();
            const isFocused = focusedIndex === index;

            return (
              <FileCard
                key={item.id}
                border
                radius={2}
                overflow="hidden"
                $focused={isFocused}
                onClick={() => setFocusedIndex(index)}
                data-staging-index={index}
              >
                {/* File Row */}
                <Box padding={3}>
                  <Flex gap={3} align="center">
                    <ItemThumbnail item={item} />

                    {/* File Info */}
                    <Box flex={1} style={{ minWidth: 0 }}>
                      <Text size={1} weight="medium" textOverflow="ellipsis">
                        {item.file.name}
                      </Text>
                      <Flex gap={2} align="center" marginTop={2}>
                        <Text size={0} muted>
                          {formatFileSize(item.file.size)}
                        </Text>
                        {!item.expanded && (missingAlt || missingTitle) && (
                          <>
                            <Text size={0} muted>
                              ·
                            </Text>
                            <Text size={0} muted>
                              {missingAlt ? "No alt text" : "No title"}
                            </Text>
                          </>
                        )}
                      </Flex>
                    </Box>

                    {/* Actions / Status */}
                    <Flex gap={1} align="center">
                      {item.uploadStatus === "uploading" && <Spinner />}
                      {item.uploadStatus === "complete" && (
                        <Text
                          size={2}
                          style={{
                            color:
                              "var(--card-badge-positive-bg-color, #2ecc71)",
                          }}
                        >
                          <CheckmarkIcon />
                        </Text>
                      )}
                      {item.uploadStatus === "error" && (
                        <Text
                          size={2}
                          style={{
                            color:
                              "var(--card-badge-critical-bg-color, #e74c3c)",
                          }}
                        >
                          <ErrorOutlineIcon />
                        </Text>
                      )}
                      {!item.uploadStatus && (
                        <>
                          <DeleteButton
                            className="delete-button"
                            icon={TrashIcon}
                            mode="bleed"
                            tone="critical"
                            padding={2}
                            onClick={() => onRemoveItem(item.id)}
                            disabled={isUploading}
                          />
                          <Button
                            icon={ChevronDownIcon}
                            mode="bleed"
                            padding={2}
                            onClick={() =>
                              onUpdateItem(item.id, {
                                expanded: !item.expanded,
                              })
                            }
                            disabled={isUploading}
                            style={{
                              transform: item.expanded
                                ? "rotate(180deg)"
                                : undefined,
                              transition: "transform 0.15s ease",
                            }}
                          />
                        </>
                      )}
                    </Flex>
                  </Flex>

                  {/* Upload Progress */}
                  {(item.uploadStatus === "uploading" ||
                    item.uploadStatus === "complete" ||
                    item.uploadStatus === "error") && (
                    <ProgressBar>
                      <ProgressFill
                        $progress={item.uploadProgress ?? 0}
                        $status={item.uploadStatus}
                      />
                    </ProgressBar>
                  )}
                </Box>

                {/* Expanded Form */}
                {item.expanded && (
                  <Box padding={3} paddingTop={0} marginLeft={6}>
                    <Stack space={3}>
                      {item.type === "image" ? (
                        <>
                          <Stack space={2}>
                            <Text size={1} weight="medium">
                              Alt text
                            </Text>
                            <TextInput
                              value={item.alt || ""}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                onUpdateItem(item.id, {
                                  alt: e.currentTarget.value,
                                })
                              }
                              placeholder="Describe the image for accessibility"
                            />
                          </Stack>
                          <Stack space={2}>
                            <Text size={1} weight="medium">
                              Caption
                            </Text>
                            <TextArea
                              value={item.caption || ""}
                              onChange={(
                                e: React.ChangeEvent<HTMLTextAreaElement>
                              ) =>
                                onUpdateItem(item.id, {
                                  caption: e.currentTarget.value,
                                })
                              }
                              placeholder="Optional caption or credit"
                              rows={2}
                            />
                          </Stack>
                        </>
                      ) : (
                        <>
                          <Stack space={2}>
                            <Text size={1} weight="medium">
                              Title
                            </Text>
                            <TextInput
                              value={item.title || ""}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                onUpdateItem(item.id, {
                                  title: e.currentTarget.value,
                                })
                              }
                              placeholder="Video title"
                            />
                          </Stack>
                          <Stack space={2}>
                            <Text size={1} weight="medium">
                              Description
                            </Text>
                            <TextArea
                              value={item.description || ""}
                              onChange={(
                                e: React.ChangeEvent<HTMLTextAreaElement>
                              ) =>
                                onUpdateItem(item.id, {
                                  description: e.currentTarget.value,
                                })
                              }
                              placeholder="Optional description"
                              rows={2}
                            />
                          </Stack>
                        </>
                      )}

                      {/* Tags */}
                      {tags.length > 0 && (
                        <Stack space={2}>
                          <Text size={1} weight="medium">
                            Tags
                          </Text>
                          <Flex gap={2} wrap="wrap" align="center">
                            {item.tags?.map((tagId) => {
                              const tag = tags.find((t) => t._id === tagId);
                              if (!tag) return null;
                              const colors =
                                TAG_COLORS[tag.color] || TAG_COLORS.gray;
                              return (
                                <Card
                                  key={tag._id}
                                  padding={1}
                                  paddingLeft={2}
                                  radius={2}
                                  style={{
                                    background: `${colors.text}10`,
                                  }}
                                >
                                  <Flex align="center" gap={1}>
                                    <Box
                                      style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: "50%",
                                        background: colors.text,
                                      }}
                                    />
                                    <Text size={0}>{tag.name}</Text>
                                    <Button
                                      icon={CloseIcon}
                                      mode="bleed"
                                      padding={1}
                                      onClick={() => {
                                        onUpdateItem(item.id, {
                                          tags: item.tags?.filter(
                                            (id) => id !== tagId
                                          ),
                                        });
                                      }}
                                    />
                                  </Flex>
                                </Card>
                              );
                            })}
                            <MenuButton
                              button={
                                <Button
                                  icon={TagIcon}
                                  text={item.tags?.length ? "Add" : "Add tag"}
                                  mode="ghost"
                                  fontSize={1}
                                  padding={2}
                                />
                              }
                              id={`staging-tag-${item.id}`}
                              menu={
                                <Menu>
                                  {tags
                                    .filter(
                                      (tag) => !item.tags?.includes(tag._id)
                                    )
                                    .map((tag) => {
                                      const colors =
                                        TAG_COLORS[tag.color] ||
                                        TAG_COLORS.gray;
                                      return (
                                        <MenuItem
                                          key={tag._id}
                                          onClick={() => {
                                            onUpdateItem(item.id, {
                                              tags: [
                                                ...(item.tags || []),
                                                tag._id,
                                              ],
                                            });
                                          }}
                                          fontSize={1}
                                          padding={2}
                                        >
                                          <Flex align="center" gap={2}>
                                            <Box
                                              style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: "50%",
                                                background: colors.text,
                                              }}
                                            />
                                            <Text size={1}>{tag.name}</Text>
                                          </Flex>
                                        </MenuItem>
                                      );
                                    })}
                                  {item.tags?.length === tags.length && (
                                    <Box padding={3}>
                                      <Text size={1} muted>
                                        All tags added
                                      </Text>
                                    </Box>
                                  )}
                                </Menu>
                              }
                              popover={{ portal: true }}
                            />
                          </Flex>
                        </Stack>
                      )}
                    </Stack>
                  </Box>
                )}
              </FileCard>
            );
          })}
        </Stack>
      </Box>
    </Dialog>
  );
}
