import {
  AddIcon,
  CalendarIcon,
  CheckmarkIcon,
  CloseIcon,
  CogIcon,
  DatabaseIcon,
  DocumentTextIcon,
  ImageIcon,
  ImagesIcon,
  PlayIcon,
  SortIcon,
  TagIcon,
  ThLargeIcon,
  ThListIcon,
  TrashIcon,
  UploadIcon,
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
  Tooltip,
} from "@sanity/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Pagination } from "../shared/pagination";
import {
  DebouncedSearchInput,
  DeleteConfirmDialog,
  MediaDetailPanel,
  MediaGridView,
  MediaListView,
  MediaSidebar,
  type Reference,
  SelectionModeFooter,
  UploadStagingDialog,
} from "./components";
import {
  type MediaAsset,
  type MediaPanelProps,
  PAGE_SIZE,
  SORT_OPTIONS,
  type SortOption,
  TAG_COLORS,
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
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  // Selection mode state
  const [selectionTarget, setSelectionTarget] = useState<MediaAsset | null>(
    null
  );

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
        ? ` && count((tags[]._ref)[@ in [${tagIds
            .map((id) => `"${id}"`)
            .join(",")}]]) == ${tagIds.length}`
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
        ? ` && count(*[_type in [${docTypes
            .map((t) => `"${t}"`)
            .join(",")}] && references(^._id)]) > 0`
        : "";

    const selectedDocIds = advancedFilters.advancedFilters.documents.map(
      (d) => d._id
    );
    const documentCondition =
      selectedDocIds.length > 0
        ? ` && count(*[_id in [${selectedDocIds
            .map((id) => `"${id}"`)
            .join(",")}] && references(^._id)]) > 0`
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
          preview,
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
  } = useSWR(
    mediaQueryKey.key,
    () =>
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
  const { data: references, isLoading: referencesLoading } = useSWR<
    Reference[]
  >(selectedMedia ? ["references", selectedMedia._id] : null, () =>
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

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragging(false);

      if (!credentials) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        uploadQueue.addFiles(files);
      }
    },
    [credentials, uploadQueue]
  );

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
          <Stack space={4}>
            <Text align="center">
              Please configure your storage credentials in the Settings tab
              first.
            </Text>
            {isDev && onOpenSettings && (
              <Flex justify="center">
                <Button
                  text="Open Settings"
                  tone="primary"
                  icon={CogIcon}
                  onClick={onOpenSettings}
                />
              </Flex>
            )}
          </Stack>
        </Card>
      </Box>
    );
  }

  return (
    <Flex
      style={{ flex: 1, minHeight: 0, position: "relative" }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drop Zone Overlay */}
      {isDragging && (
        <Box
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "color-mix(in srgb, var(--card-bg-color) 90%, transparent)",
            backdropFilter: "blur(4px)",
            border: "3px dashed var(--card-focus-ring-color)",
            borderRadius: "4px",
            margin: "8px",
            pointerEvents: "none",
          }}
        >
          <Stack space={3} style={{ textAlign: "center" }}>
            <Text size={4}>
              <UploadIcon />
            </Text>
            <Text size={2} weight="semibold">
              Drop files to upload
            </Text>
            <Text size={1} muted>
              Images and videos
            </Text>
          </Stack>
        </Box>
      )}
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
          /* Hide button text on mobile, show only icons */
          #type-filter-menu [data-ui="Flex"] > div[data-ui="Box"],
          #sort-menu [data-ui="Flex"] > div[data-ui="Box"] {
            display: none;
          }
          @media (min-width: 640px) {
            #type-filter-menu [data-ui="Flex"] > div[data-ui="Box"],
            #sort-menu [data-ui="Flex"] > div[data-ui="Box"] {
              display: block;
            }
          }
          /* Hide title on mobile */
          .media-toolbar-title {
            display: none;
          }
          @media (min-width: 640px) {
            .media-toolbar-title {
              display: flex;
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
      <Box
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
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
          <Stack space={3}>
            {/* Row 1: Search + Upload + Settings */}
            <Flex paddingX={4} gap={2} align="center">
              <Box style={{ flex: 1 }}>
                <DebouncedSearchInput onSearch={handleSearch} />
              </Box>
              {selectionMode && onCancelSelection ? (
                <Flex gap={2} align="center">
                  <Button
                    icon={AddIcon}
                    mode="ghost"
                    tone="primary"
                    onClick={() => uploadQueue.fileInputRef.current?.click()}
                    padding={3}
                    fontSize={1}
                    title="Upload"
                  />
                  <Button
                    icon={CloseIcon}
                    mode="bleed"
                    onClick={onCancelSelection}
                    padding={3}
                    fontSize={1}
                    title="Cancel and go back"
                  />
                </Flex>
              ) : (
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
              <input
                ref={uploadQueue.fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={uploadQueue.handleFileSelect}
                style={{ display: "none" }}
              />
            </Flex>

            {/* Row 2: Select All + Title | Filters + View Toggle */}
            <Flex paddingX={4} gap={2} align="center" justify="space-between">
              {/* Left side */}
              <Flex align="center" gap={3}>
                {/* Select All Checkbox */}
                {!selectionMode && (
                  <>
                    <Box
                      role="checkbox"
                      tabIndex={0}
                      aria-checked={
                        bulkSelection.selectionCount === media.length
                          ? true
                          : bulkSelection.selectionCount > 0
                          ? "mixed"
                          : false
                      }
                      aria-label="Select all media items"
                      onClick={() => {
                        if (bulkSelection.selectionCount === media.length) {
                          bulkSelection.exitSelectionMode();
                        } else {
                          bulkSelection.selectAll();
                        }
                      }}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (bulkSelection.selectionCount === media.length) {
                            bulkSelection.exitSelectionMode();
                          } else {
                            bulkSelection.selectAll();
                          }
                        }
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <Box
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "4px",
                          border:
                            bulkSelection.selectionCount > 0
                              ? "none"
                              : "2px solid var(--card-border-color)",
                          background:
                            bulkSelection.selectionCount > 0
                              ? "var(--card-focus-ring-color)"
                              : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {bulkSelection.selectionCount > 0 && (
                          <CheckmarkIcon
                            style={{ color: "white", fontSize: 12 }}
                          />
                        )}
                      </Box>
                    </Box>
                    <Box
                      style={{
                        width: "1px",
                        height: "20px",
                        background: "var(--card-border-color)",
                      }}
                    />
                  </>
                )}

                {/* Title and count */}
                <Flex align="baseline" gap={2}>
                  <span className="media-toolbar-title">
                    <Text size={2} weight="bold">
                      {selectionMode ? "Select Media" : "Media Library"}
                    </Text>
                  </span>
                  <Text size={1} muted>
                    {bulkSelection.hasSelection && !selectionMode
                      ? `${bulkSelection.selectionCount} of ${totalCount} selected`
                      : `${totalCount} ${totalCount === 1 ? "item" : "items"}`}
                  </Text>
                </Flex>
              </Flex>

              {/* Right side */}
              <Flex gap={2} align="center">
                {/* Bulk actions when items selected */}
                {bulkSelection.hasSelection && !selectionMode && (
                  <>
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
                              <Text size={0} muted weight="semibold">
                                ADD TAG
                              </Text>
                            </Box>
                            {tagEditor.tags.map((tag) => {
                              const colors =
                                TAG_COLORS[tag.color] || TAG_COLORS.gray;
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
                              style={{
                                borderTop: "1px solid var(--card-border-color)",
                              }}
                            >
                              <Text size={0} muted weight="semibold">
                                REMOVE TAG
                              </Text>
                            </Box>
                            {tagEditor.tags.map((tag) => {
                              const colors =
                                TAG_COLORS[tag.color] || TAG_COLORS.gray;
                              return (
                                <MenuItem
                                  key={`remove-${tag._id}`}
                                  onClick={() =>
                                    bulkSelection.bulkRemoveTag(tag)
                                  }
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
                  </>
                )}

                {/* Type Filter */}
                {selectionMode &&
                selectionAssetType &&
                selectionAssetType !== "file" ? (
                  <Button
                    icon={selectionAssetType === "image" ? ImageIcon : PlayIcon}
                    text={
                      selectionAssetType === "image"
                        ? "Images only"
                        : "Videos only"
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
                            : ImagesIcon
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
                          icon={ImagesIcon}
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
                      {SORT_OPTIONS.map((option) => {
                        const getSortIcon = () => {
                          if (option.field === "date") return CalendarIcon;
                          if (option.field === "filename")
                            return DocumentTextIcon;
                          return DatabaseIcon; // size
                        };
                        return (
                          <MenuItem
                            key={`${option.field}-${option.direction}`}
                            icon={getSortIcon()}
                            text={option.label}
                            pressed={
                              sortOption.field === option.field &&
                              sortOption.direction === option.direction
                            }
                            onClick={() => setSortOption(option)}
                            fontSize={1}
                          />
                        );
                      })}
                    </Menu>
                  }
                  popover={{ portal: true }}
                />

                {/* View Toggle */}
                <Tooltip
                  content={
                    <Box padding={2}>
                      <Text size={1}>
                        {viewMode === "grid"
                          ? "Switch to list view"
                          : "Switch to grid view"}
                      </Text>
                    </Box>
                  }
                  placement="bottom"
                  portal
                >
                  <Button
                    icon={viewMode === "grid" ? ThLargeIcon : ThListIcon}
                    mode="ghost"
                    onClick={() =>
                      setViewMode(viewMode === "grid" ? "list" : "grid")
                    }
                    padding={3}
                    fontSize={1}
                  />
                </Tooltip>
              </Flex>
            </Flex>
          </Stack>
        </Box>

        {/* Scrollable Content */}
        <Box style={{ flex: 1, overflow: "auto" }} paddingY={4}>
          <Stack space={4}>
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
                    <Stack
                      space={3}
                      style={{ textAlign: "center", maxWidth: "320px" }}
                    >
                      <Text size={2} weight="semibold">
                        No media yet
                      </Text>
                      <Text size={1} muted>
                        Upload images and videos to get started with your media
                        library.
                      </Text>
                      <Button
                        icon={AddIcon}
                        text="Upload"
                        tone="primary"
                        onClick={() =>
                          uploadQueue.fileInputRef.current?.click()
                        }
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
                    <Stack
                      space={3}
                      style={{ textAlign: "center", maxWidth: "320px" }}
                    >
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <Box
            paddingX={4}
            paddingY={3}
            style={{ borderTop: "1px solid var(--card-border-color)" }}
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </Box>
        )}

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
        {uploadQueue.showStagingDialog &&
          uploadQueue.stagingItems.length > 0 && (
            <UploadStagingDialog
              stagingItems={uploadQueue.stagingItems}
              tags={tagEditor.tags}
              onClose={uploadQueue.closeStagingDialog}
              onStartUpload={uploadQueue.startUpload}
              onUpdateItem={uploadQueue.updateStagingItem}
              onRemoveItem={uploadQueue.removeStagingItem}
              isUploading={uploadQueue.isUploading}
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
