import {
  AddIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  CogIcon,
  ImageIcon,
  PlayIcon,
  SortIcon,
  TagIcon,
  TrashIcon,
  ThLargeIcon,
  ThListIcon,
} from "@sanity/icons";
import {
  Box,
  Button,
  Card,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  Spinner,
  Stack,
  Text,
} from "@sanity/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { isDev, useClient } from "sanity";
import useSWR from "swr";
import { API_VERSION } from "../../constants";
import { useCredentials } from "../../hooks/use-credentials";
import {
  useAdvancedFilters,
  useBulkSelection,
  useDocumentSearch,
  useReferencingDocTypes,
  useTagEditor,
  useUploadQueue,
} from "../shared/hooks";
import {
  DebouncedSearchInput,
  DeleteConfirmDialog,
  MediaDetailPanel,
  MediaGridView,
  MediaListView,
  MediaSidebar,
  SelectionModeFooter,
  UploadStagingDialog,
  type Reference,
} from "./components";
import {
  PAGE_SIZE,
  SORT_OPTIONS,
  TAG_COLORS,
  type MediaAsset,
  type MediaPanelProps,
  type SortOption,
  type TypeFilter,
  type ViewMode,
} from "./types";

export function MediaPanel({
  adapter,
  selectionMode = false,
  selectionAssetType,
  onSelect,
  onCancelSelection,
  onOpenSettings,
}: MediaPanelProps) {
  const client = useClient({ apiVersion: API_VERSION });
  const { credentials, loading: credentialsLoading } = useCredentials(adapter);

  // UI State
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>(SORT_OPTIONS[0]);
  const defaultTypeFilter: TypeFilter =
    selectionMode && selectionAssetType === "image"
      ? "image"
      : selectionMode && selectionAssetType === "video"
        ? "video"
        : "all";
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(defaultTypeFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());

  // Selection mode state
  const [selectionTarget, setSelectionTarget] = useState<MediaAsset | null>(null);

  // Detail panel state
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset | null>(null);

  // Custom hooks
  const advancedFilters = useAdvancedFilters();
  const tagEditor = useTagEditor({ adapter });
  const { docTypes: referencingDocTypes } = useReferencingDocTypes({ adapter });
  const { results: documentSearchResults, isLoading: documentSearchLoading } =
    useDocumentSearch({
      adapter,
      query: advancedFilters.documentSearchQuery,
    });

  // Build query key for SWR (memoized)
  const mediaQueryKey = useMemo(() => {
    let typeCondition: string;
    if (typeFilter === "image") {
      typeCondition = `_type == "${adapter.typePrefix}.imageAsset"`;
    } else if (typeFilter === "video") {
      typeCondition = `_type == "${adapter.typePrefix}.videoAsset"`;
    } else {
      typeCondition = `_type in ["${adapter.typePrefix}.imageAsset", "${adapter.typePrefix}.videoAsset"]`;
    }

    const searchCondition = search.trim()
      ? ` && originalFilename match "*${search.trim()}*"`
      : "";

    const tagIds = Array.from(selectedTagIds);
    const tagCondition =
      tagIds.length > 0
        ? ` && count((tags[]._ref)[@ in [${tagIds.map((id) => `"${id}"`).join(",")}]]) == ${tagIds.length}`
        : "";

    // Advanced filter conditions
    const assetTypes = `"${adapter.typePrefix}.imageAsset", "${adapter.typePrefix}.videoAsset"`;
    let usageCondition = "";
    if (advancedFilters.advancedFilters.usage === "inUse") {
      usageCondition = ` && count(*[references(^._id) && !(_type in [${assetTypes}])]) > 0`;
    } else if (advancedFilters.advancedFilters.usage === "unused") {
      usageCondition = ` && count(*[references(^._id) && !(_type in [${assetTypes}])]) == 0`;
    }

    const docTypes = Array.from(advancedFilters.advancedFilters.documentTypes);
    const docTypeCondition =
      docTypes.length > 0 && advancedFilters.advancedFilters.usage === "inUse"
        ? ` && count(*[_type in [${docTypes.map((t) => `"${t}"`).join(",")}] && references(^._id)]) > 0`
        : "";

    const selectedDocIds = advancedFilters.advancedFilters.documents.map((d) => d._id);
    const documentCondition =
      selectedDocIds.length > 0
        ? ` && count(*[_id in [${selectedDocIds.map((id) => `"${id}"`).join(",")}] && references(^._id)]) > 0`
        : "";

    // Metadata filters (tri-state: null = no filter, true = has, false = missing)
    const metadataConditions = [
      advancedFilters.advancedFilters.alt === true
        ? "(defined(alt) && alt != '')"
        : advancedFilters.advancedFilters.alt === false
          ? "(!defined(alt) || alt == '')"
          : null,
      advancedFilters.advancedFilters.title === true
        ? "(defined(title) && title != '')"
        : advancedFilters.advancedFilters.title === false
          ? "(!defined(title) || title == '')"
          : null,
      advancedFilters.advancedFilters.caption === true
        ? "(defined(caption) && caption != '')"
        : advancedFilters.advancedFilters.caption === false
          ? "(!defined(caption) || caption == '')"
          : null,
    ]
      .filter(Boolean)
      .map((c) => ` && ${c}`)
      .join("");

    const advancedConditions = `${usageCondition}${docTypeCondition}${documentCondition}${metadataConditions}`;

    let orderClause: string;
    const dir = sortOption.direction === "desc" ? "desc" : "asc";
    switch (sortOption.field) {
      case "filename":
        orderClause = `order(originalFilename ${dir})`;
        break;
      case "size":
        orderClause = `order(size ${dir})`;
        break;
      case "date":
      default:
        orderClause = `order(_createdAt ${dir})`;
        break;
    }

    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    const advancedFiltersKey = JSON.stringify({
      usage: advancedFilters.advancedFilters.usage,
      documentTypes: Array.from(advancedFilters.advancedFilters.documentTypes),
      documents: advancedFilters.advancedFilters.documents.map((d) => d._id),
      alt: advancedFilters.advancedFilters.alt,
      title: advancedFilters.advancedFilters.title,
      caption: advancedFilters.advancedFilters.caption,
    });

    return {
      key: [
        "media",
        adapter.typePrefix,
        typeFilter,
        search,
        sortOption.field,
        sortOption.direction,
        currentPage,
        ...tagIds,
        advancedFiltersKey,
      ] as const,
      query: `{
        "total": count(*[${typeCondition}${searchCondition}${tagCondition}${advancedConditions}]),
        "items": *[${typeCondition}${searchCondition}${tagCondition}${advancedConditions}] | ${orderClause} [${start}...${end}] {
          _id,
          _type,
          _createdAt,
          url,
          path,
          originalFilename,
          size,
          mimeType,
          extension,
          metadata,
          tags,
          alt,
          caption,
          title,
          description,
          "thumbnail": thumbnail->{_id, url, path}
        }
      }`,
    };
  }, [
    adapter.typePrefix,
    typeFilter,
    search,
    sortOption.field,
    sortOption.direction,
    currentPage,
    selectedTagIds,
    advancedFilters.advancedFilters,
  ]);

  // SWR for media data
  const {
    data: mediaData,
    isLoading,
    mutate: mutateMedia,
  } = useSWR(mediaQueryKey.key, () =>
    client.fetch<{ total: number; items: Omit<MediaAsset, "mediaType">[] }>(
      mediaQueryKey.query
    ),
    { keepPreviousData: true }
  );

  // SWR for counts
  const { data: counts, mutate: mutateCounts } = useSWR(
    ["counts", adapter.typePrefix],
    () =>
      client.fetch<{ total: number; images: number; videos: number }>(`{
      "total": count(*[_type in ["${adapter.typePrefix}.imageAsset", "${adapter.typePrefix}.videoAsset"]]),
      "images": count(*[_type == "${adapter.typePrefix}.imageAsset"]),
      "videos": count(*[_type == "${adapter.typePrefix}.videoAsset"])
    }`),
    { fallbackData: { total: 0, images: 0, videos: 0 } }
  );

  // SWR for references to selected media
  const { data: references, isLoading: referencesLoading } = useSWR<Reference[]>(
    selectedMedia ? ["references", selectedMedia._id] : null,
    () =>
      client.fetch<Reference[]>(
        `
      *[references($assetId)] {
        _id,
        _type,
        "title": coalesce(title, name, originalFilename, _id),
        "url": url,
        "thumbnailUrl": thumbnail->url,
        "isAsset": _type == $imageAssetType || _type == $videoAssetType,
        "assetType": select(
          _type == $imageAssetType => "image",
          _type == $videoAssetType => "video",
          null
        )
      }[0...50]
    `,
        {
          assetId: selectedMedia!._id,
          imageAssetType: `${adapter.typePrefix}.imageAsset`,
          videoAssetType: `${adapter.typePrefix}.videoAsset`,
        }
      )
  );

  // SWR for usage counts
  const { data: usageCounts } = useSWR(
    ["usageCounts", adapter.typePrefix],
    () =>
      client.fetch<{ inUse: number; unused: number }>(
        `{
      "inUse": count(*[_type in [$imageType, $videoType] && count(*[references(^._id) && !(_type in [$imageType, $videoType])]) > 0]),
      "unused": count(*[_type in [$imageType, $videoType] && count(*[references(^._id) && !(_type in [$imageType, $videoType])]) == 0])
    }`,
        {
          imageType: `${adapter.typePrefix}.imageAsset`,
          videoType: `${adapter.typePrefix}.videoAsset`,
        }
      ),
    { fallbackData: { inUse: 0, unused: 0 } }
  );

  // Transform media data
  const media = useMemo(
    () =>
      (mediaData?.items ?? []).map((item) => ({
        ...item,
        mediaType: item._type.endsWith(".videoAsset") ? "video" : "image",
      })) as MediaAsset[],
    [mediaData?.items]
  );
  const totalCount = mediaData?.total ?? 0;
  const loading = isLoading && !mediaData;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Revalidate function
  const revalidate = useCallback(() => {
    mutateMedia();
    mutateCounts();
    tagEditor.mutateTags();
  }, [mutateMedia, mutateCounts, tagEditor]);

  // Upload queue hook
  const uploadQueue = useUploadQueue({
    adapter,
    onUploadComplete: revalidate,
  });

  // Bulk selection hook
  const bulkSelection = useBulkSelection({
    media,
    credentials,
    onDelete: () => {
      setSelectedMedia(null);
      revalidate();
    },
    onMutate: () => mutateMedia(),
  });

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  // Lock type filter in selection mode
  useEffect(() => {
    if (selectionMode && selectionAssetType) {
      if (selectionAssetType === "image") {
        setTypeFilter("image");
      } else if (selectionAssetType === "video") {
        setTypeFilter("video");
      }
    }
  }, [selectionMode, selectionAssetType]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, sortOption, selectedTagIds, advancedFilters.advancedFilters]);

  // Tag selection toggle
  const toggleTagSelection = useCallback((tagId: string) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }
      return next;
    });
  }, []);

  if (loading || credentialsLoading) {
    return (
      <Box padding={4}>
        <Flex justify="center" align="center" style={{ minHeight: "200px" }}>
          <Spinner />
        </Flex>
      </Box>
    );
  }

  if (!credentials) {
    return (
      <Box padding={4}>
        <Card padding={4} radius={2} shadow={1} tone="caution">
          <Text align="center">
            Please configure your storage credentials in the Settings tab first.
          </Text>
        </Card>
      </Box>
    );
  }

  return (
    <Flex style={{ flex: 1, minHeight: 0 }}>
      <style>
        {`
          .media-sidebar {
            display: none !important;
          }
          .media-sidebar-toggle {
            display: none !important;
          }
          @media (min-width: 768px) {
            .media-sidebar {
              display: flex !important;
            }
            .media-sidebar-toggle {
              display: flex !important;
            }
          }
        `}
      </style>

      {/* Tag Sidebar */}
      <MediaSidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        tags={tagEditor.tags}
        selectedTagIds={selectedTagIds}
        onTagSelect={toggleTagSelection}
        onClearTagSelection={() => setSelectedTagIds(new Set())}
        isCreatingTag={tagEditor.isCreatingTag}
        editingTag={tagEditor.editingTag}
        newTagName={tagEditor.newTagName}
        newTagColor={tagEditor.newTagColor}
        isSavingTag={tagEditor.isSavingTag}
        onNewTagNameChange={tagEditor.setNewTagName}
        onNewTagColorChange={tagEditor.setNewTagColor}
        onStartCreateTag={tagEditor.startCreateTag}
        onStartEditTag={tagEditor.startEditTag}
        onCancelTagEdit={tagEditor.cancelTagEdit}
        onSaveTag={tagEditor.saveTag}
        onDeleteTag={(tag) => {
          tagEditor.deleteTag(tag);
          setSelectedTagIds((prev) => {
            const next = new Set(prev);
            next.delete(tag._id);
            return next;
          });
        }}
        advancedFilters={advancedFilters.advancedFilters}
        activeFilterCount={advancedFilters.activeFilterCount}
        usageCounts={usageCounts}
        referencingDocTypes={referencingDocTypes}
        documentSearchQuery={advancedFilters.documentSearchQuery}
        documentSearchResults={documentSearchResults}
        documentSearchLoading={documentSearchLoading}
        onDocumentSearchChange={advancedFilters.setDocumentSearchQuery}
        onClearAllFilters={advancedFilters.clearAllFilters}
        onUpdateUsageFilter={advancedFilters.updateUsageFilter}
        onToggleDocumentType={advancedFilters.toggleDocumentType}
        onCycleMetadataFilter={advancedFilters.cycleMetadataFilter}
        onAddDocument={advancedFilters.addDocument}
        onRemoveDocument={advancedFilters.removeDocument}
      />

      {/* Main Content */}
      <Box style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {/* Sticky Header */}
        <Box
          paddingY={4}
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "var(--card-bg-color)",
            borderBottom: "1px solid var(--card-border-color)",
          }}
        >
          <Stack space={4}>
            {/* Header */}
            <Flex justify="space-between" align="center" paddingX={4} gap={2} wrap="wrap">
            {bulkSelection.hasSelection && !selectionMode ? (
              <>
                <Flex align="center" gap={2}>
                  <Button
                    icon={CloseIcon}
                    mode="ghost"
                    onClick={bulkSelection.exitSelectionMode}
                    fontSize={1}
                    padding={2}
                    title="Cancel selection"
                  />
                  <Text size={1} weight="medium">
                    {bulkSelection.selectionCount} selected
                  </Text>
                </Flex>
                <Flex gap={2}>
                  <Button
                    text="Select All"
                    mode="ghost"
                    onClick={bulkSelection.selectAll}
                    fontSize={1}
                    padding={2}
                    disabled={bulkSelection.selectionCount === media.length}
                  />
                  {tagEditor.tags.length > 0 && (
                    <MenuButton
                      button={
                        <Button
                          icon={TagIcon}
                          text="Tag"
                          mode="ghost"
                          tone="primary"
                          fontSize={1}
                          padding={2}
                        />
                      }
                      id="bulk-tag-menu"
                      menu={
                        <Menu>
                          <Box paddingX={3} paddingY={2}>
                            <Text size={0} muted weight="semibold">ADD TAG</Text>
                          </Box>
                          {tagEditor.tags.map((tag) => {
                            const colors = TAG_COLORS[tag.color] || TAG_COLORS.gray;
                            return (
                              <MenuItem
                                key={`add-${tag._id}`}
                                onClick={() => bulkSelection.bulkAddTag(tag)}
                                fontSize={1}
                              >
                                <Flex align="center" gap={2}>
                                  <Box
                                    style={{
                                      width: "8px",
                                      height: "8px",
                                      borderRadius: "50%",
                                      background: colors.text,
                                      flexShrink: 0,
                                    }}
                                  />
                                  <Text size={1}>{tag.name}</Text>
                                </Flex>
                              </MenuItem>
                            );
                          })}
                          <Box
                            paddingX={3}
                            paddingY={2}
                            marginTop={2}
                            style={{ borderTop: "1px solid var(--card-border-color)" }}
                          >
                            <Text size={0} muted weight="semibold">REMOVE TAG</Text>
                          </Box>
                          {tagEditor.tags.map((tag) => {
                            const colors = TAG_COLORS[tag.color] || TAG_COLORS.gray;
                            return (
                              <MenuItem
                                key={`remove-${tag._id}`}
                                onClick={() => bulkSelection.bulkRemoveTag(tag)}
                                fontSize={1}
                                tone="critical"
                              >
                                <Flex align="center" gap={2}>
                                  <Box
                                    style={{
                                      width: "8px",
                                      height: "8px",
                                      borderRadius: "50%",
                                      background: colors.text,
                                      flexShrink: 0,
                                    }}
                                  />
                                  <Text size={1}>{tag.name}</Text>
                                </Flex>
                              </MenuItem>
                            );
                          })}
                        </Menu>
                      }
                      popover={{ portal: true }}
                    />
                  )}
                  <Button
                    icon={TrashIcon}
                    text="Delete"
                    mode="ghost"
                    tone="critical"
                    onClick={() => bulkSelection.openDeleteDialog("bulk")}
                    disabled={bulkSelection.isDeleting}
                    fontSize={1}
                    padding={2}
                  />
                </Flex>
              </>
            ) : (
              <>
                <Text size={2} weight="bold">
                  {selectionMode ? "Select Media" : "Media Library"}
                </Text>
                {selectionMode && onCancelSelection && (
                  <Flex gap={2} align="center">
                    <Button
                      icon={AddIcon}
                      mode="ghost"
                      tone="primary"
                      onClick={() => uploadQueue.fileInputRef.current?.click()}
                      padding={2}
                      fontSize={1}
                      title="Upload"
                    />
                    <Button
                      icon={CloseIcon}
                      mode="bleed"
                      onClick={onCancelSelection}
                      padding={2}
                      fontSize={1}
                      title="Cancel and go back"
                    />
                  </Flex>
                )}
                {!selectionMode && (
                  <Flex gap={2} align="center">
                    <Button
                      icon={AddIcon}
                      text="Upload"
                      mode="ghost"
                      tone="primary"
                      onClick={() => uploadQueue.fileInputRef.current?.click()}
                      fontSize={1}
                      padding={3}
                    />
                    {onOpenSettings && isDev && (
                      <Button
                        icon={CogIcon}
                        mode="ghost"
                        onClick={onOpenSettings}
                        padding={3}
                        fontSize={1}
                        title="Settings"
                      />
                    )}
                  </Flex>
                )}
              </>
            )}
            <input
              ref={uploadQueue.fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={uploadQueue.handleFileSelect}
              style={{ display: "none" }}
            />
          </Flex>

          {/* Controls */}
          <Box paddingX={4}>
            <Flex gap={2} wrap="wrap" align="center">
              {/* View Toggle */}
              <Flex
                style={{
                  borderRadius: "3px",
                  overflow: "hidden",
                  border: "1px solid var(--card-border-color)",
                }}
              >
                <Button
                  icon={ThLargeIcon}
                  mode="bleed"
                  tone={viewMode === "grid" ? "primary" : "default"}
                  onClick={() => setViewMode("grid")}
                  padding={3}
                  fontSize={1}
                  title="Grid view"
                  style={{
                    borderRadius: 0,
                    background:
                      viewMode === "grid"
                        ? "var(--card-badge-default-bg-color)"
                        : "transparent",
                  }}
                />
                <Box
                  style={{
                    width: "1px",
                    background: "var(--card-border-color)",
                  }}
                />
                <Button
                  icon={ThListIcon}
                  mode="bleed"
                  tone={viewMode === "list" ? "primary" : "default"}
                  onClick={() => setViewMode("list")}
                  padding={3}
                  fontSize={1}
                  title="List view"
                  style={{
                    borderRadius: 0,
                    background:
                      viewMode === "list"
                        ? "var(--card-badge-default-bg-color)"
                        : "transparent",
                  }}
                />
              </Flex>

              {/* Search */}
              <Box style={{ flex: 1, minWidth: "120px" }}>
                <DebouncedSearchInput onSearch={handleSearch} />
              </Box>

              {/* Type Filter */}
              {selectionMode &&
              selectionAssetType &&
              selectionAssetType !== "file" ? (
                <Button
                  icon={selectionAssetType === "image" ? ImageIcon : PlayIcon}
                  text={
                    selectionAssetType === "image" ? "Images only" : "Videos only"
                  }
                  mode="ghost"
                  fontSize={1}
                  padding={3}
                  disabled
                />
              ) : (
                <MenuButton
                  button={
                    <Button
                      icon={
                        typeFilter === "image"
                          ? ImageIcon
                          : typeFilter === "video"
                            ? PlayIcon
                            : undefined
                      }
                      text={
                        typeFilter === "all"
                          ? "All types"
                          : typeFilter === "image"
                            ? `Images (${counts?.images ?? 0})`
                            : `Videos (${counts?.videos ?? 0})`
                      }
                      mode="ghost"
                      fontSize={1}
                      padding={3}
                    />
                  }
                  id="type-filter-menu"
                  menu={
                    <Menu>
                      <MenuItem
                        text={`All types (${counts?.total ?? 0})`}
                        pressed={typeFilter === "all"}
                        onClick={() => setTypeFilter("all")}
                        fontSize={1}
                      />
                      <MenuItem
                        icon={ImageIcon}
                        text={`Images (${counts?.images ?? 0})`}
                        pressed={typeFilter === "image"}
                        onClick={() => setTypeFilter("image")}
                        fontSize={1}
                      />
                      <MenuItem
                        icon={PlayIcon}
                        text={`Videos (${counts?.videos ?? 0})`}
                        pressed={typeFilter === "video"}
                        onClick={() => setTypeFilter("video")}
                        fontSize={1}
                      />
                    </Menu>
                  }
                  popover={{ portal: true }}
                />
              )}

              {/* Sort */}
              <MenuButton
                button={
                  <Button
                    icon={SortIcon}
                    text={sortOption.label}
                    mode="ghost"
                    fontSize={1}
                    padding={3}
                  />
                }
                id="sort-menu"
                menu={
                  <Menu>
                    {SORT_OPTIONS.map((option) => (
                      <MenuItem
                        key={`${option.field}-${option.direction}`}
                        text={option.label}
                        pressed={
                          sortOption.field === option.field &&
                          sortOption.direction === option.direction
                        }
                        onClick={() => setSortOption(option)}
                        fontSize={1}
                      />
                    ))}
                  </Menu>
                }
                popover={{ portal: true }}
              />
            </Flex>
          </Box>

          </Stack>
        </Box>

        {/* Scrollable Content */}
        <Box style={{ flex: 1, overflow: "auto" }} paddingY={4}>
          <Stack space={4}>
          {/* Results count and pagination */}
          <Flex paddingX={4} justify="space-between" align="center">
            <Text size={1} muted>
              {totalCount} {totalCount === 1 ? "item" : "items"}
              {search && ` matching "${search}"`}
            </Text>
            {totalPages > 1 && (
              <Flex align="center" gap={2}>
                <Button
                  icon={ChevronLeftIcon}
                  mode="ghost"
                  padding={2}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                />
                <Text size={1} muted>
                  Page {currentPage} of {totalPages}
                </Text>
                <Button
                  icon={ChevronRightIcon}
                  mode="ghost"
                  padding={2}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                />
              </Flex>
            )}
          </Flex>

          {/* Upload Progress */}
          {uploadQueue.uploadQueue.length > 0 && (
            <Box paddingX={4}>
              <Card padding={3} radius={2} shadow={1}>
                <Stack space={3}>
                  <Flex justify="space-between" align="center">
                    <Text size={1} weight="semibold">
                      {uploadQueue.isUploading
                        ? `Uploading ${uploadQueue.activeUploads.length} file${uploadQueue.activeUploads.length > 1 ? "s" : ""}...`
                        : "Upload complete"}
                    </Text>
                    {!uploadQueue.isUploading && (
                      <Button
                        text="Clear"
                        mode="ghost"
                        fontSize={1}
                        padding={2}
                        onClick={uploadQueue.clearCompletedUploads}
                      />
                    )}
                  </Flex>
                  <Stack space={2}>
                    {uploadQueue.uploadQueue.map((item) => (
                      <Card
                        key={item.id}
                        padding={2}
                        radius={2}
                        tone={
                          item.status === "error"
                            ? "critical"
                            : item.status === "completed"
                              ? "positive"
                              : "default"
                        }
                      >
                        <Flex gap={3} align="center">
                          <Box style={{ flex: 1 }}>
                            <Text size={0} textOverflow="ellipsis">
                              {item.file.name}
                            </Text>
                            {item.status === "uploading" && (
                              <Box
                                style={{
                                  marginTop: "4px",
                                  height: "4px",
                                  background: "var(--card-border-color)",
                                  borderRadius: "2px",
                                  overflow: "hidden",
                                }}
                              >
                                <Box
                                  style={{
                                    height: "100%",
                                    width: `${item.progress}%`,
                                    background: "var(--card-focus-ring-color)",
                                    transition: "width 0.2s ease",
                                  }}
                                />
                              </Box>
                            )}
                            {item.status === "error" && item.error && (
                              <Text size={0} muted>
                                {item.error}
                              </Text>
                            )}
                          </Box>
                          <Text size={0} muted>
                            {item.status === "pending" && "Waiting..."}
                            {item.status === "uploading" && `${item.progress}%`}
                            {item.status === "completed" && "Done"}
                            {item.status === "error" && "Failed"}
                          </Text>
                        </Flex>
                      </Card>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            </Box>
          )}

          {/* Media Content */}
          <Box paddingX={4}>
            {counts?.total === 0 ? (
              <Card padding={5} radius={2} tone="transparent" border>
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  style={{ minHeight: "300px" }}
                >
                  <Stack space={3} style={{ textAlign: "center", maxWidth: "320px" }}>
                    <Text size={2} weight="semibold">
                      No media yet
                    </Text>
                    <Text size={1} muted>
                      Upload images and videos to get started with your media library.
                    </Text>
                    <Button
                      icon={AddIcon}
                      text="Upload"
                      tone="primary"
                      onClick={() => uploadQueue.fileInputRef.current?.click()}
                      fontSize={1}
                      padding={3}
                    />
                  </Stack>
                </Flex>
              </Card>
            ) : totalCount === 0 && (search || typeFilter !== "all") ? (
              <Card padding={5} radius={2} tone="transparent" border>
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  style={{ minHeight: "200px" }}
                >
                  <Stack space={3} style={{ textAlign: "center", maxWidth: "320px" }}>
                    <Text size={2} weight="semibold">
                      No results found
                    </Text>
                    <Text size={1} muted>
                      Try adjusting your search or filters.
                    </Text>
                    <Button
                      text="Clear filters"
                      mode="ghost"
                      onClick={() => {
                        setSearch("");
                        setTypeFilter("all");
                      }}
                      fontSize={1}
                      padding={2}
                    />
                  </Stack>
                </Flex>
              </Card>
            ) : viewMode === "grid" ? (
              <MediaGridView
                media={media}
                tags={tagEditor.tags}
                selectionMode={selectionMode}
                selectionTarget={selectionTarget}
                selectedIds={bulkSelection.selectedIds}
                onItemClick={(item) => {
                  if (selectionMode) {
                    setSelectionTarget(item);
                  } else {
                    setSelectedMedia(item);
                  }
                }}
                onToggleSelection={bulkSelection.toggleSelection}
                showTypeIndicator={typeFilter === "all"}
              />
            ) : (
              <MediaListView
                media={media}
                tags={tagEditor.tags}
                selectionMode={selectionMode}
                selectionTarget={selectionTarget}
                selectedIds={bulkSelection.selectedIds}
                onItemClick={(item) => {
                  if (selectionMode) {
                    setSelectionTarget(item);
                  } else {
                    setSelectedMedia(item);
                  }
                }}
                onToggleSelection={bulkSelection.toggleSelection}
              />
            )}
          </Box>
          </Stack>
        </Box>

        {/* Media Detail Side Panel */}
        {selectedMedia && (
          <MediaDetailPanel
            media={selectedMedia}
            allMedia={media}
            tags={tagEditor.tags}
            references={references}
            referencesLoading={referencesLoading}
            onClose={() => setSelectedMedia(null)}
            onMediaChange={setSelectedMedia}
            onNavigateToMedia={setSelectedMedia}
            onDelete={() => bulkSelection.openDeleteDialog("single")}
            onMutate={() => mutateMedia()}
            isDeleting={bulkSelection.isDeleting}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={bulkSelection.deleteDialogOpen}
          target={bulkSelection.deleteTarget}
          singleAssetName={selectedMedia?.originalFilename}
          bulkCount={bulkSelection.selectionCount}
          isDeleting={bulkSelection.isDeleting}
          onConfirm={() => bulkSelection.confirmDelete(selectedMedia)}
          onCancel={bulkSelection.closeDeleteDialog}
        />

        {/* Upload Staging Dialog */}
        {uploadQueue.showStagingDialog && uploadQueue.stagingItems.length > 0 && (
          <UploadStagingDialog
            stagingItems={uploadQueue.stagingItems}
            tags={tagEditor.tags}
            onClose={uploadQueue.closeStagingDialog}
            onStartUpload={uploadQueue.startUpload}
            onUpdateItem={uploadQueue.updateStagingItem}
            onRemoveItem={uploadQueue.removeStagingItem}
          />
        )}

        {/* Selection Mode Footer */}
        {selectionMode && selectionTarget && onSelect && (
          <SelectionModeFooter
            selectedAsset={selectionTarget}
            sidebarOpen={sidebarOpen}
            onSelect={() => onSelect(selectionTarget)}
          />
        )}
      </Box>
    </Flex>
  );
}
