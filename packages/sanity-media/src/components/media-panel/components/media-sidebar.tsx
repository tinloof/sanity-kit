import {
  AddIcon,
  CloseIcon,
  DocumentIcon,
  EditIcon,
  ImageIcon,
  SearchIcon,
  TrashIcon,
} from "@sanity/icons";
import {
  Box,
  Button,
  Card,
  Checkbox,
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

export function MediaSidebar({
  open,
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
  usageCounts,
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
  return (
    <Box
      className="media-sidebar"
      style={{
        width: open ? "220px" : "0px",
        flexShrink: 0,
        borderRight: open ? "1px solid var(--card-border-color)" : "none",
        flexDirection: "column",
        overflow: "hidden",
        transition: "width 0.2s ease",
      }}
    >
      {/* Tags Header */}
      <Box padding={3} style={{ borderBottom: "1px solid var(--card-border-color)" }}>
        <Flex align="center" justify="space-between">
          <Text size={1} weight="semibold">
            Tags
          </Text>
          <Button
            icon={AddIcon}
            mode="bleed"
            padding={2}
            fontSize={0}
            onClick={onStartCreateTag}
            title="Create tag"
          />
        </Flex>
      </Box>

      {/* Create/Edit Tag Form */}
      {(isCreatingTag || editingTag) && (
        <Box padding={3} style={{ borderBottom: "1px solid var(--card-border-color)" }}>
          <Stack space={3}>
            <TextInput
              value={newTagName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onNewTagNameChange(e.currentTarget.value)
              }
              placeholder="Tag name"
              fontSize={1}
              padding={2}
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
                fontSize={0}
                padding={2}
                onClick={onSaveTag}
                disabled={!newTagName.trim() || isSavingTag}
                style={{ flex: 1 }}
              />
              <Button
                text="Cancel"
                mode="ghost"
                fontSize={0}
                padding={2}
                onClick={onCancelTagEdit}
                style={{ flex: 1 }}
              />
            </Flex>
          </Stack>
        </Box>
      )}

      {/* Tag List */}
      <Box style={{ flex: 1, overflowY: "auto" }} padding={2}>
        <Stack space={1}>
          {/* All Media option */}
          <Box
            padding={2}
            style={{
              borderRadius: "4px",
              cursor: "pointer",
              background:
                selectedTagIds.size === 0 ? "var(--card-muted-bg-color)" : "transparent",
            }}
            onClick={onClearTagSelection}
          >
            <Flex align="center" gap={2}>
              <ImageIcon style={{ fontSize: 14, opacity: 0.6 }} />
              <Text
                size={1}
                weight={selectedTagIds.size === 0 ? "medium" : "regular"}
              >
                All Media
              </Text>
            </Flex>
          </Box>

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
                        if (confirm(`Delete tag "${tag.name}"?`)) {
                          onDeleteTag(tag);
                        }
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
                </Flex>
              );
            })
          )}

          {/* Filters Section */}
          <Box
            marginTop={4}
            paddingTop={3}
            style={{ borderTop: "1px solid var(--card-border-color)" }}
          >
            <Stack space={4}>
              {/* Filters Header */}
              <Flex align="center" justify="space-between" paddingX={1}>
                <Text size={1} weight="semibold">
                  Filters
                </Text>
                {activeFilterCount > 0 && (
                  <Button
                    text="Clear"
                    mode="bleed"
                    tone="critical"
                    fontSize={0}
                    padding={1}
                    onClick={onClearAllFilters}
                  />
                )}
              </Flex>

              {/* Usage Filter */}
              <Stack space={2} paddingX={1}>
                <Text size={0} muted weight="medium">
                  Usage
                </Text>
                <Stack space={1}>
                  {(["all", "inUse", "unused"] as UsageFilter[]).map((value) => {
                    const labels: Record<UsageFilter, string> = {
                      all: "All",
                      inUse: `In Use${usageCounts?.inUse !== undefined ? ` (${usageCounts.inUse})` : ""}`,
                      unused: `Unused${usageCounts?.unused !== undefined ? ` (${usageCounts.unused})` : ""}`,
                    };
                    const isActive = advancedFilters.usage === value;
                    return (
                      <Box
                        key={value}
                        padding={2}
                        style={{
                          borderRadius: "4px",
                          cursor: "pointer",
                          background: isActive
                            ? "var(--card-muted-bg-color)"
                            : "transparent",
                        }}
                        onClick={() => onUpdateUsageFilter(value)}
                      >
                        <Text size={1} weight={isActive ? "medium" : "regular"}>
                          {labels[value]}
                        </Text>
                      </Box>
                    );
                  })}
                </Stack>
              </Stack>

              {/* Document Types (only when "In Use") */}
              {advancedFilters.usage === "inUse" && referencingDocTypes.length > 0 && (
                <Stack space={2} paddingX={1}>
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
                          }}
                          onClick={() => onToggleDocumentType(docType)}
                        >
                          <Flex align="center" gap={2}>
                            <Checkbox checked={isSelected} readOnly />
                            <Text size={1}>{docType}</Text>
                          </Flex>
                        </Box>
                      );
                    })}
                  </Stack>
                </Stack>
              )}

              {/* Search for Specific Documents */}
              <Stack space={2} paddingX={1}>
                <Text size={0} muted weight="medium">
                  Used In Document
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
                    padding={2}
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
                          padding={1}
                          onClick={() => onRemoveDocument(doc._id)}
                          style={{ flexShrink: 0 }}
                        />
                      </Flex>
                    ))}
                  </Stack>
                )}
              </Stack>

              {/* Metadata */}
              <Stack space={2} paddingX={1}>
                <Text size={0} muted weight="medium">
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
                    return (
                      <Box
                        key={key}
                        padding={2}
                        style={{
                          borderRadius: "4px",
                          cursor: "pointer",
                          background:
                            value !== null
                              ? "var(--card-muted-bg-color)"
                              : "transparent",
                        }}
                        onClick={() => onCycleMetadataFilter(key)}
                      >
                        <Flex align="center" gap={2}>
                          <Checkbox
                            checked={value === true}
                            indeterminate={value === false}
                            readOnly
                          />
                          <Text size={1}>{displayLabel}</Text>
                        </Flex>
                      </Box>
                    );
                  })}
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
