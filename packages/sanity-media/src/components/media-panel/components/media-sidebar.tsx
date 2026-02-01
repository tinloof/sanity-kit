import { useState } from "react";
import {
  AddIcon,
  CloseIcon,
  DocumentIcon,
  EditIcon,
  FilterIcon,
  SearchIcon,
  TrashIcon,
} from "@sanity/icons";
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Spinner,
  Stack,
  Text,
  TextInput,
} from "@sanity/ui";
import type {
  AdvancedFilters,
  SelectedDocument,
  Tag,
  UsageFilter,
} from "../types";
import { TAG_COLORS } from "../types";

export interface MediaSidebarProps {
  open: boolean;
  onToggle: () => void;

  // Tags
  tags: Tag[];
  selectedTagIds: Set<string>;
  onTagSelect: (tagId: string) => void;
  onClearTagSelection: () => void;

  // Tag editor state
  isCreatingTag: boolean;
  editingTag: Tag | null;
  newTagName: string;
  newTagColor: string;
  isSavingTag: boolean;
  onNewTagNameChange: (name: string) => void;
  onNewTagColorChange: (color: string) => void;
  onStartCreateTag: () => void;
  onStartEditTag: (tag: Tag) => void;
  onCancelTagEdit: () => void;
  onSaveTag: () => void;
  onDeleteTag: (tag: Tag) => void;

  // Filters
  advancedFilters: AdvancedFilters;
  activeFilterCount: number;
  usageCounts?: { inUse: number; unused: number };
  referencingDocTypes: string[];
  documentSearchQuery: string;
  documentSearchResults: Array<{ _id: string; _type: string; title: string }>;
  documentSearchLoading: boolean;
  onDocumentSearchChange: (query: string) => void;
  onClearAllFilters: () => void;
  onUpdateUsageFilter: (usage: UsageFilter) => void;
  onToggleDocumentType: (docType: string) => void;
  onCycleMetadataFilter: (key: "alt" | "title" | "caption") => void;
  onAddDocument: (doc: SelectedDocument) => void;
  onRemoveDocument: (docId: string) => void;
}

// Colors for metadata filter states
const METADATA_COLORS = {
  checked: {
    bg: "rgba(67, 160, 71, 0.15)",
    border: "rgba(67, 160, 71, 0.8)",
    text: "#43a047",
  },
  indeterminate: {
    bg: "rgba(239, 108, 0, 0.15)",
    border: "rgba(239, 108, 0, 0.8)",
    text: "#ef6c00",
  },
};

export function MediaSidebar({
  open,
  onToggle,
  tags,
  selectedTagIds,
  onTagSelect,
  onClearTagSelection,
  isCreatingTag,
  editingTag,
  newTagName,
  newTagColor,
  isSavingTag,
  onNewTagNameChange,
  onNewTagColorChange,
  onStartCreateTag,
  onStartEditTag,
  onCancelTagEdit,
  onSaveTag,
  onDeleteTag,
  advancedFilters,
  activeFilterCount,
  referencingDocTypes,
  documentSearchQuery,
  documentSearchResults,
  documentSearchLoading,
  onDocumentSearchChange,
  onClearAllFilters,
  onUpdateUsageFilter,
  onToggleDocumentType,
  onCycleMetadataFilter,
  onAddDocument,
  onRemoveDocument,
}: MediaSidebarProps) {
  const [tagEditMode, setTagEditMode] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  return (
    <Box
      className="media-sidebar"
      style={{
        width: open ? "220px" : "41px",
        flexShrink: 0,
        borderRight: "1px solid var(--card-border-color)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "width 0.2s ease",
      }}
    >
      {/* Toggle Button Header */}
      <Flex
        align="center"
        gap={2}
        padding={2}
        style={{ borderBottom: "1px solid var(--card-border-color)" }}
      >
        <Button
          icon={FilterIcon}
          mode="bleed"
          tone={open ? "primary" : "default"}
          onClick={onToggle}
          padding={2}
          fontSize={1}
          title={open ? "Collapse sidebar" : "Expand sidebar"}
          style={{
            background: open ? "var(--card-badge-default-bg-color)" : "transparent",
          }}
        />
        {open && (
          <>
            <Text size={1} weight="semibold" style={{ flex: 1 }}>
              Filters
            </Text>
            {activeFilterCount > 0 && (
              <Button
                text="Clear all"
                mode="bleed"
                tone="critical"
                fontSize={1}
                padding={2}
                onClick={onClearAllFilters}
              />
            )}
          </>
        )}
      </Flex>

      {/* Sidebar Content - only visible when open */}
      {open && (
        <Box style={{ flex: 1, overflowY: "auto" }}>
          {/* Tags Section */}
          <Box padding={3} style={{ borderBottom: "1px solid var(--card-border-color)" }}>
            <Stack space={3}>
              {/* Tags Header */}
              <Flex align="center" justify="space-between">
                <Text size={1} weight="semibold">
                  Tags
                </Text>
                <Button
                  icon={EditIcon}
                  mode="bleed"
                  tone={tagEditMode ? "primary" : "default"}
                  padding={2}
                  fontSize={1}
                  onClick={() => setTagEditMode(!tagEditMode)}
                  title={tagEditMode ? "Done editing" : "Edit tags"}
                  style={{
                    background: tagEditMode ? "var(--card-badge-default-bg-color)" : "transparent",
                  }}
                />
              </Flex>

              {/* Create/Edit Tag Form */}
              {(isCreatingTag || editingTag) && (
                <Stack space={3}>
                  <TextInput
                    value={newTagName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onNewTagNameChange(e.currentTarget.value)
                    }
                    placeholder="Tag name"
                    fontSize={1}
                    padding={3}
                  />
                  <Flex gap={1} wrap="wrap">
                    {Object.entries(TAG_COLORS).map(([colorName, colors]) => (
                      <Box
                        key={colorName}
                        onClick={() => onNewTagColorChange(colorName)}
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "4px",
                          background: colors.text,
                          cursor: "pointer",
                          outline:
                            newTagColor === colorName
                              ? "2px solid var(--card-focus-ring-color)"
                              : "none",
                          outlineOffset: "1px",
                        }}
                      />
                    ))}
                  </Flex>
                  <Flex gap={2}>
                    <Button
                      text={editingTag ? "Save" : "Create"}
                      tone="primary"
                      mode="ghost"
                      fontSize={1}
                      padding={3}
                      onClick={onSaveTag}
                      disabled={!newTagName.trim() || isSavingTag}
                      style={{ flex: 1 }}
                    />
                    <Button
                      text="Cancel"
                      mode="ghost"
                      fontSize={1}
                      padding={3}
                      onClick={onCancelTagEdit}
                      style={{ flex: 1 }}
                    />
                  </Flex>
                </Stack>
              )}

              {/* Tag List */}
              <Stack space={1}>
                {tags.length === 0 ? (
                  <Box padding={2}>
                    <Text size={1} muted>
                      No tags yet
                    </Text>
                  </Box>
                ) : (
                  tags.map((tag) => {
                    const isSelected = selectedTagIds.has(tag._id);
                    const colors = TAG_COLORS[tag.color] || TAG_COLORS.gray;
                    return (
                      <Flex
                        key={tag._id}
                        align="center"
                        gap={2}
                        padding={2}
                        style={{
                          borderRadius: "4px",
                          cursor: "pointer",
                          background: isSelected ? colors.bg : "transparent",
                          border: isSelected
                            ? `1px solid ${colors.text}`
                            : "1px solid transparent",
                        }}
                      >
                        <Box
                          onClick={() => onTagSelect(tag._id)}
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Box
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              background: colors.text,
                              flexShrink: 0,
                            }}
                          />
                          <Text
                            size={1}
                            weight={isSelected ? "medium" : "regular"}
                            textOverflow="ellipsis"
                            style={{ flex: 1 }}
                          >
                            {tag.name}
                          </Text>
                        </Box>
                        {tagEditMode && (
                          <Flex gap={1} style={{ opacity: 0.6 }}>
                            <Box
                              as="button"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                onStartEditTag(tag);
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                padding: "2px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                color: "inherit",
                              }}
                              title="Edit tag"
                            >
                              <EditIcon style={{ fontSize: 14 }} />
                            </Box>
                            <Box
                              as="button"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                setTagToDelete(tag);
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                padding: "2px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                color: "inherit",
                              }}
                              title="Delete tag"
                            >
                              <TrashIcon style={{ fontSize: 14 }} />
                            </Box>
                          </Flex>
                        )}
                      </Flex>
                    );
                  })
                )}

                {/* Add Tag Button - only in edit mode */}
                {tagEditMode && !isCreatingTag && !editingTag && (
                  <Button
                    icon={AddIcon}
                    text="Add tag"
                    mode="ghost"
                    padding={2}
                    fontSize={1}
                    onClick={onStartCreateTag}
                    style={{ justifyContent: "flex-start" }}
                  />
                )}
              </Stack>
            </Stack>
          </Box>

          {/* Usage Section */}
          <Box padding={3} style={{ borderBottom: "1px solid var(--card-border-color)" }}>
            <Stack space={3}>
              <Text size={1} weight="semibold">
                Usage
              </Text>
              {/* Usage Toggle Group */}
              <Flex
                style={{
                  border: "1px solid var(--card-border-color)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                {(["all", "inUse", "unused"] as UsageFilter[]).map((value, index) => {
                  const labels: Record<UsageFilter, string> = {
                    all: "All",
                    inUse: "In Use",
                    unused: "Unused",
                  };
                  const isActive = advancedFilters.usage === value;
                  return (
                    <Box
                      key={value}
                      padding={2}
                      onClick={() => onUpdateUsageFilter(value)}
                      style={{
                        flex: 1,
                        cursor: "pointer",
                        background: isActive
                          ? "var(--card-muted-bg-color)"
                          : "transparent",
                        borderRight: index < 2 ? "1px solid var(--card-border-color)" : undefined,
                        textAlign: "center",
                      }}
                    >
                      <Text size={0} weight={isActive ? "semibold" : "regular"}>
                        {labels[value]}
                      </Text>
                    </Box>
                  );
                })}
              </Flex>

              {/* Document Types (only when "In Use") */}
              {advancedFilters.usage === "inUse" && referencingDocTypes.length > 0 && (
                <Stack space={2}>
                  <Text size={0} muted weight="medium">
                    Document Types
                  </Text>
                  <Stack space={1}>
                    {referencingDocTypes.map((docType) => {
                      const isSelected = advancedFilters.documentTypes.has(docType);
                      return (
                        <Box
                          key={docType}
                          padding={2}
                          style={{
                            borderRadius: "4px",
                            cursor: "pointer",
                            background: isSelected
                              ? "var(--card-muted-bg-color)"
                              : "transparent",
                            border: isSelected
                              ? "1px solid var(--card-border-color)"
                              : "1px solid transparent",
                          }}
                          onClick={() => onToggleDocumentType(docType)}
                        >
                          <Flex align="center" gap={2}>
                            <Box
                              style={{
                                width: "14px",
                                height: "14px",
                                borderRadius: "3px",
                                border: isSelected
                                  ? "2px solid var(--card-focus-ring-color)"
                                  : "2px solid var(--card-border-color)",
                                background: isSelected
                                  ? "var(--card-focus-ring-color)"
                                  : "transparent",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {isSelected && (
                                <Box
                                  style={{
                                    width: "6px",
                                    height: "6px",
                                    background: "white",
                                    borderRadius: "1px",
                                  }}
                                />
                              )}
                            </Box>
                            <Text size={1}>{docType}</Text>
                          </Flex>
                        </Box>
                      );
                    })}
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Box>

          {/* Used In Document Section */}
          <Box padding={3} style={{ borderBottom: "1px solid var(--card-border-color)" }}>
            <Stack space={3}>
              <Text size={1} weight="semibold">
                Used in Document
              </Text>
              <Box style={{ position: "relative" }}>
                <TextInput
                  icon={SearchIcon}
                  placeholder="Search documents..."
                  value={documentSearchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onDocumentSearchChange(e.currentTarget.value)
                  }
                  fontSize={1}
                  padding={3}
                />
                {documentSearchQuery.trim().length >= 2 && (
                  <Card
                    padding={1}
                    radius={2}
                    shadow={2}
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      marginTop: "4px",
                      maxHeight: "200px",
                      overflowY: "auto",
                      zIndex: 100,
                    }}
                  >
                    {documentSearchLoading ? (
                      <Flex justify="center" padding={3}>
                        <Spinner />
                      </Flex>
                    ) : documentSearchResults.length > 0 ? (
                      <Stack space={0}>
                        {documentSearchResults
                          .filter(
                            (doc) =>
                              !advancedFilters.documents.some(
                                (d) => d._id === doc._id
                              )
                          )
                          .map((doc) => (
                            <Box
                              key={doc._id}
                              padding={2}
                              style={{
                                cursor: "pointer",
                                borderRadius: "4px",
                              }}
                              onClick={() => {
                                onAddDocument(doc);
                              }}
                            >
                              <Flex align="center" gap={2}>
                                <DocumentIcon
                                  style={{
                                    fontSize: 16,
                                    opacity: 0.6,
                                    flexShrink: 0,
                                  }}
                                />
                                <Stack space={1} style={{ flex: 1, minWidth: 0 }}>
                                  <Text size={1} textOverflow="ellipsis">
                                    {doc.title}
                                  </Text>
                                  <Text size={0} muted>
                                    {doc._type}
                                  </Text>
                                </Stack>
                              </Flex>
                            </Box>
                          ))}
                      </Stack>
                    ) : (
                      <Box padding={3}>
                        <Text size={1} muted align="center">
                          No documents found
                        </Text>
                      </Box>
                    )}
                  </Card>
                )}
              </Box>
              {advancedFilters.documents.length > 0 && (
                <Stack space={1}>
                  {advancedFilters.documents.map((doc) => (
                    <Flex
                      key={doc._id}
                      align="center"
                      gap={2}
                      padding={2}
                      style={{
                        border: "1px solid var(--card-border-color)",
                        borderRadius: "4px",
                      }}
                    >
                      <DocumentIcon
                        style={{ fontSize: 14, opacity: 0.6, flexShrink: 0 }}
                      />
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text size={1} textOverflow="ellipsis">
                          {doc.title}
                        </Text>
                      </Box>
                      <Button
                        icon={CloseIcon}
                        mode="bleed"
                        padding={2}
                        fontSize={1}
                        onClick={() => onRemoveDocument(doc._id)}
                        style={{ flexShrink: 0 }}
                      />
                    </Flex>
                  ))}
                </Stack>
              )}
            </Stack>
          </Box>

          {/* Metadata Section */}
          <Box padding={3}>
            <Stack space={3}>
              <Text size={1} weight="semibold">
                Metadata
              </Text>
              <Stack space={1}>
                {[
                  {
                    key: "alt" as const,
                    label: "Alt text",
                    value: advancedFilters.alt,
                  },
                  {
                    key: "title" as const,
                    label: "Title",
                    value: advancedFilters.title,
                  },
                  {
                    key: "caption" as const,
                    label: "Caption",
                    value: advancedFilters.caption,
                  },
                ].map(({ key, label, value }) => {
                  const displayLabel =
                    value === true
                      ? `Has ${label.toLowerCase()}`
                      : value === false
                        ? `Missing ${label.toLowerCase()}`
                        : label;

                  const colors =
                    value === true
                      ? METADATA_COLORS.checked
                      : value === false
                        ? METADATA_COLORS.indeterminate
                        : null;

                  return (
                    <Box
                      key={key}
                      padding={2}
                      style={{
                        borderRadius: "4px",
                        cursor: "pointer",
                        background: colors?.bg || "transparent",
                        border: colors
                          ? `1px solid ${colors.border}`
                          : "1px solid transparent",
                      }}
                      onClick={() => onCycleMetadataFilter(key)}
                    >
                      <Flex align="center" gap={2}>
                        <Box
                          style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "3px",
                            border: colors
                              ? `2px solid ${colors.border}`
                              : "2px solid var(--card-border-color)",
                            background: value === true
                              ? colors?.border
                              : value === false
                                ? colors?.border
                                : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {value === true && (
                            <Box
                              style={{
                                width: "6px",
                                height: "6px",
                                background: "white",
                                borderRadius: "1px",
                              }}
                            />
                          )}
                          {value === false && (
                            <Box
                              style={{
                                width: "8px",
                                height: "2px",
                                background: "white",
                                borderRadius: "1px",
                              }}
                            />
                          )}
                        </Box>
                        <Text
                          size={1}
                          style={colors ? { color: colors.text } : undefined}
                        >
                          {displayLabel}
                        </Text>
                      </Flex>
                    </Box>
                  );
                })}
              </Stack>
            </Stack>
          </Box>
        </Box>
      )}

      {/* Delete Tag Confirmation Dialog */}
      {tagToDelete && (
        <Dialog
          id="delete-tag-dialog"
          header="Delete tag"
          onClose={() => setTagToDelete(null)}
          zOffset={1000}
          width={1}
        >
          <Box padding={4}>
            <Stack space={4}>
              <Text>
                Are you sure you want to delete the tag "{tagToDelete.name}"?
              </Text>
              <Text size={1} muted>
                This will remove the tag from all assets. This action cannot be undone.
              </Text>
              <Flex gap={2} justify="flex-end">
                <Button
                  text="Cancel"
                  mode="ghost"
                  onClick={() => setTagToDelete(null)}
                  fontSize={1}
                  padding={3}
                />
                <Button
                  icon={TrashIcon}
                  text="Delete"
                  tone="critical"
                  onClick={() => {
                    onDeleteTag(tagToDelete);
                    setTagToDelete(null);
                  }}
                  fontSize={1}
                  padding={3}
                />
              </Flex>
            </Stack>
          </Box>
        </Dialog>
      )}
    </Box>
  );
}
