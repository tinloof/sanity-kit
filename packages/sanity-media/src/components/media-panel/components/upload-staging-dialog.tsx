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
import { formatFileSize } from "../../../utils";
import { TAG_COLORS, type StagingItem, type Tag } from "../types";

export interface UploadStagingDialogProps {
  stagingItems: StagingItem[];
  tags: Tag[];
  onClose: () => void;
  onStartUpload: () => void;
  onUpdateItem: (id: string, updates: Partial<StagingItem>) => void;
  onRemoveItem: (id: string) => void;
}

export function UploadStagingDialog({
  stagingItems,
  tags,
  onClose,
  onStartUpload,
  onUpdateItem,
  onRemoveItem,
}: UploadStagingDialogProps) {
  return (
    <Dialog
      id="upload-staging-dialog"
      header={`Upload ${stagingItems.length} file${stagingItems.length > 1 ? "s" : ""}`}
      onClose={onClose}
      zOffset={1000}
      width={2}
    >
      <Box padding={4}>
        <Stack space={4}>
          {/* File List */}
          <Stack space={0}>
            {stagingItems.map((item, index) => (
              <Box
                key={item.id}
                padding={3}
                style={{
                  borderBottom:
                    index < stagingItems.length - 1
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
                              onUpdateItem(item.id, {
                                title: e.currentTarget.value,
                              })
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
                                    <Text
                                      size={0}
                                      style={{ color: colors.text }}
                                    >
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
                                  .filter(
                                    (tag) => !item.tags?.includes(tag._id)
                                  )
                                  .map((tag) => {
                                    const colors =
                                      TAG_COLORS[tag.color] || TAG_COLORS.gray;
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
              onClick={onStartUpload}
              fontSize={1}
            />
          </Flex>
        </Stack>
      </Box>
    </Dialog>
  );
}
