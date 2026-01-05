import {
  ChevronDownIcon,
  CloseIcon,
  TagIcon,
  TrashIcon,
  UploadIcon,
} from "@sanity/icons";
import {
  Box,
  Button,
  Dialog,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  Stack,
  Text,
  TextArea,
  TextInput,
} from "@sanity/ui";
import type { StagingItem, Tag } from "../media-panel/types";
import { formatFileSize, TAG_COLORS } from "../media-panel/types";

export interface StagingDialogProps {
  /** List of items to upload */
  items: StagingItem[];
  /** Available tags */
  tags: Tag[];
  /** Update a staging item */
  onUpdateItem: (id: string, updates: Partial<StagingItem>) => void;
  /** Remove a staging item */
  onRemoveItem: (id: string) => void;
  /** Start the upload */
  onUpload: () => void;
  /** Close the dialog */
  onClose: () => void;
  /** Whether this is rendered as a standalone dialog or embedded */
  embedded?: boolean;
}

export function StagingDialog({
  items,
  tags,
  onUpdateItem,
  onRemoveItem,
  onUpload,
  onClose,
  embedded = false,
}: StagingDialogProps) {
  const content = (
    <Stack space={4}>
      {/* File List */}
      <Stack space={0}>
        {items.map((item, index) => (
          <Box
            key={item.id}
            padding={3}
            style={{
              borderBottom:
                index < items.length - 1
                  ? "1px solid var(--card-border-color)"
                  : undefined,
            }}
          >
            <Stack space={3}>
              {/* Header Row */}
              <Flex gap={3}>
                {/* Preview */}
                <Box
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "3px",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {item.type === "image" ? (
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <video
                      src={item.previewUrl}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        background: "#000",
                      }}
                    />
                  )}
                </Box>

                {/* File Info & Actions */}
                <Flex
                  direction="column"
                  justify="space-between"
                  style={{ flex: 1, minWidth: 0, minHeight: "40px" }}
                >
                  <Text size={1} textOverflow="ellipsis">
                    {item.file.name}
                  </Text>
                  <Flex justify="space-between" align="center">
                    <Text size={0} muted>
                      {formatFileSize(item.file.size)}
                    </Text>
                    <Flex gap={1}>
                      <Button
                        icon={ChevronDownIcon}
                        mode="bleed"
                        padding={2}
                        fontSize={1}
                        onClick={() =>
                          onUpdateItem(item.id, { expanded: !item.expanded })
                        }
                        style={{
                          transform: item.expanded
                            ? "rotate(180deg)"
                            : undefined,
                          transition: "transform 0.15s ease",
                        }}
                      />
                      <Button
                        icon={TrashIcon}
                        mode="bleed"
                        padding={2}
                        fontSize={1}
                        onClick={() => onRemoveItem(item.id)}
                      />
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>

              {/* Expanded Metadata Form */}
              {item.expanded && (
                <Stack space={3} paddingTop={2}>
                  {item.type === "image" ? (
                    <>
                      <TextInput
                        value={item.alt || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          onUpdateItem(item.id, { alt: e.currentTarget.value })
                        }
                        placeholder="Alt text"
                        fontSize={1}
                      />
                      <TextArea
                        value={item.caption || ""}
                        onChange={(
                          e: React.ChangeEvent<HTMLTextAreaElement>
                        ) =>
                          onUpdateItem(item.id, {
                            caption: e.currentTarget.value,
                          })
                        }
                        placeholder="Caption"
                        fontSize={1}
                        rows={2}
                      />
                    </>
                  ) : (
                    <>
                      <TextInput
                        value={item.title || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          onUpdateItem(item.id, { title: e.currentTarget.value })
                        }
                        placeholder="Title"
                        fontSize={1}
                      />
                      <TextArea
                        value={item.description || ""}
                        onChange={(
                          e: React.ChangeEvent<HTMLTextAreaElement>
                        ) =>
                          onUpdateItem(item.id, {
                            description: e.currentTarget.value,
                          })
                        }
                        placeholder="Description"
                        fontSize={1}
                        rows={2}
                      />
                    </>
                  )}
                  {/* Tags */}
                  {tags.length > 0 && (
                    <Stack space={2}>
                      {/* Selected tags */}
                      {item.tags && item.tags.length > 0 && (
                        <Flex gap={2} wrap="wrap">
                          {item.tags.map((tagId) => {
                            const tag = tags.find((t) => t._id === tagId);
                            if (!tag) return null;
                            const colors =
                              TAG_COLORS[tag.color] || TAG_COLORS.gray;
                            return (
                              <Flex
                                key={tag._id}
                                align="center"
                                gap={1}
                                padding={1}
                                paddingLeft={2}
                                style={{
                                  background: `${colors.text}08`,
                                  border: `1px solid ${colors.text}`,
                                  borderRadius: "4px",
                                }}
                              >
                                <Text size={0} style={{ color: colors.text }}>
                                  {tag.name}
                                </Text>
                                <Button
                                  icon={CloseIcon}
                                  mode="bleed"
                                  padding={1}
                                  fontSize={0}
                                  onClick={() => {
                                    onUpdateItem(item.id, {
                                      tags: item.tags?.filter(
                                        (id) => id !== tagId
                                      ),
                                    });
                                  }}
                                  style={{ color: colors.text }}
                                />
                              </Flex>
                            );
                          })}
                        </Flex>
                      )}
                      {/* Tag selector */}
                      <MenuButton
                        button={
                          <Button
                            icon={TagIcon}
                            text="Add tag"
                            mode="ghost"
                            fontSize={1}
                          />
                        }
                        id={`staging-tag-${item.id}`}
                        menu={
                          <Menu>
                            {tags
                              .filter((tag) => !item.tags?.includes(tag._id))
                              .map((tag) => {
                                const colors =
                                  TAG_COLORS[tag.color] || TAG_COLORS.gray;
                                return (
                                  <MenuItem
                                    key={tag._id}
                                    onClick={() => {
                                      onUpdateItem(item.id, {
                                        tags: [...(item.tags || []), tag._id],
                                      });
                                    }}
                                    fontSize={1}
                                    padding={2}
                                  >
                                    <Flex align="center" gap={2}>
                                      <Box
                                        style={{
                                          width: "8px",
                                          height: "8px",
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
                    </Stack>
                  )}
                </Stack>
              )}
            </Stack>
          </Box>
        ))}
      </Stack>

      {/* Actions */}
      <Flex gap={2} justify="flex-end">
        <Button text="Cancel" mode="ghost" onClick={onClose} fontSize={1} />
        <Button
          icon={UploadIcon}
          text="Upload"
          tone="primary"
          onClick={onUpload}
          fontSize={1}
        />
      </Flex>
    </Stack>
  );

  if (embedded) {
    return <Box padding={4}>{content}</Box>;
  }

  return (
    <Dialog
      id="upload-staging-dialog"
      header={`Upload ${items.length} file${items.length > 1 ? "s" : ""}`}
      onClose={onClose}
      zOffset={1000}
      width={2}
    >
      <Box padding={4}>{content}</Box>
    </Dialog>
  );
}

/** Helper to create staging items from files */
export function createStagingItems(files: FileList | File[]): StagingItem[] {
  return Array.from(files)
    .filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      return isImage || isVideo;
    })
    .map((file, index) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      type: file.type.startsWith("image/")
        ? ("image" as const)
        : ("video" as const),
      previewUrl: URL.createObjectURL(file),
      expanded: index === 0, // Expand first item by default
    }));
}

/** Helper to clean up staging items (revoke object URLs) */
export function cleanupStagingItems(items: StagingItem[]): void {
  items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
}
