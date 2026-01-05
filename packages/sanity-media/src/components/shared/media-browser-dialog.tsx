import {
  AddIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  SearchIcon,
  TagIcon,
} from "@sanity/icons";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Dialog,
  Flex,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Text,
  TextInput,
} from "@sanity/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { useClient } from "sanity";
import type { StorageAdapter } from "../../adapters";
import { useCredentials } from "../../hooks/use-credentials";
import { handleImageUpload, handleVideoUpload } from "../../upload-handler";
import type {
  AdvancedFilters,
  MediaAsset,
  SortOption,
  StagingItem,
  TypeFilter,
  UploadItem,
  UsageFilter,
  ViewMode,
} from "../media-panel/types";
import {
  DEFAULT_ADVANCED_FILTERS,
  MAX_CONCURRENT_UPLOADS,
  PAGE_SIZE,
  SORT_OPTIONS,
  TAG_COLORS,
} from "../media-panel/types";
import { AssetGrid } from "./asset-grid";
import { AssetList } from "./asset-list";
import { FilterToolbar } from "./filter-toolbar";
import { useMediaQuery } from "./hooks/use-media-query";
import { useDocumentSearch, useReferencingDocTypes, useTags } from "./hooks/use-tags";
import {
  cleanupStagingItems,
  createStagingItems,
  StagingDialog,
} from "./staging-dialog";

export interface MediaBrowserDialogProps {
  /** Callback when an asset is selected */
  onSelect: (asset: MediaAsset) => void;
  /** Callback to close the dialog */
  onClose: () => void;
  /** Storage adapter */
  adapter: StorageAdapter;
  /** Restrict to specific asset type */
  assetType?: "image" | "video";
  /** Allow uploading new files */
  allowUpload?: boolean;
  /** Initial tab to show */
  initialTab?: "browse" | "upload";
  /** Initial files to stage for upload */
  initialFiles?: File[];
}

export function MediaBrowserDialog({
  onSelect,
  onClose,
  adapter,
  assetType,
  allowUpload = true,
  initialTab = "browse",
  initialFiles,
}: MediaBrowserDialogProps) {
  const client = useClient({ apiVersion: "2024-01-01" });
  const { credentials, loading: credentialsLoading } = useCredentials(adapter);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI State
  const [activeTab, setActiveTab] = useState<"browse" | "upload">(initialTab);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter State
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(assetType || "all");
  const [sortOption, setSortOption] = useState<SortOption>(SORT_OPTIONS[0]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(
    DEFAULT_ADVANCED_FILTERS
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Document search for advanced filters
  const [documentSearchQuery, setDocumentSearchQuery] = useState("");

  // Upload State
  const [stagingItems, setStagingItems] = useState<StagingItem[]>([]);
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);

  // Data hooks
  const { tags } = useTags();
  const { docTypes: referencingDocTypes } = useReferencingDocTypes({ adapter });
  const { results: documentSearchResults, isLoading: documentSearchLoading } =
    useDocumentSearch({ adapter, query: documentSearchQuery });
  const {
    media,
    totalCount,
    isLoading,
    counts,
    usageCounts,
    mutate: mutateMedia,
  } = useMediaQuery({
    adapter,
    typeFilter: assetType || typeFilter,
    search,
    sortOption,
    selectedTagIds,
    advancedFilters,
    page: currentPage,
    assetType,
  });

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Initialize staging items from initialFiles
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      const items = createStagingItems(initialFiles);
      setStagingItems(items);
      if (items.length > 0) {
        setActiveTab("upload");
      }
    }
  }, [initialFiles]);

  // Cleanup staging items on unmount
  useEffect(() => {
    return () => {
      cleanupStagingItems(stagingItems);
    };
  }, [stagingItems]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, sortOption, selectedTagIds, advancedFilters]);

  // Handle file selection for upload
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const newItems = createStagingItems(files);
      if (newItems.length > 0) {
        setStagingItems((prev) => [...prev, ...newItems]);
        setActiveTab("upload");
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    []
  );

  // Update staging item
  const updateStagingItem = useCallback(
    (id: string, updates: Partial<StagingItem>) => {
      setStagingItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    []
  );

  // Remove staging item
  const removeStagingItem = useCallback((id: string) => {
    setStagingItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  // Close staging dialog
  const closeStagingDialog = useCallback(() => {
    cleanupStagingItems(stagingItems);
    setStagingItems([]);
    setActiveTab("browse");
  }, [stagingItems]);

  // Start upload
  const startUpload = useCallback(() => {
    const newUploadItems: UploadItem[] = stagingItems.map((item) => ({
      id: item.id,
      file: item.file,
      type: item.type,
      status: "pending" as const,
      progress: 0,
      alt: item.alt,
      caption: item.caption,
      title: item.title,
      description: item.description,
      tags: item.tags,
    }));

    setUploadQueue((prev) => [...prev, ...newUploadItems]);
    cleanupStagingItems(stagingItems);
    setStagingItems([]);
  }, [stagingItems]);

  // Upload single item
  const uploadSingleItem = useCallback(
    async (item: UploadItem) => {
      if (!credentials) return;

      setUploadQueue((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "uploading" } : i))
      );

      try {
        const onProgress = (progress: number) => {
          setUploadQueue((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, progress } : i))
          );
        };

        if (item.type === "image") {
          await handleImageUpload(
            item.file,
            adapter,
            credentials,
            client,
            onProgress,
            { alt: item.alt, caption: item.caption, tags: item.tags }
          );
        } else {
          await handleVideoUpload(
            item.file,
            adapter,
            credentials,
            client,
            onProgress,
            { title: item.title, description: item.description, tags: item.tags }
          );
        }

        setUploadQueue((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: "completed", progress: 100 } : i
          )
        );
      } catch (error) {
        console.error("Upload failed:", error);
        setUploadQueue((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: "error",
                  error:
                    error instanceof Error ? error.message : "Upload failed",
                }
              : i
          )
        );
      }
    },
    [credentials, adapter, client]
  );

  // Process upload queue
  useEffect(() => {
    const pending = uploadQueue.filter((i) => i.status === "pending");
    const uploading = uploadQueue.filter((i) => i.status === "uploading");
    const availableSlots = MAX_CONCURRENT_UPLOADS - uploading.length;

    if (pending.length > 0 && availableSlots > 0) {
      const toStart = pending.slice(0, availableSlots);
      toStart.forEach((item) => uploadSingleItem(item));
    }

    // Refresh list when all uploads complete
    const allDone =
      uploadQueue.length > 0 &&
      uploadQueue.every((i) => i.status === "completed" || i.status === "error");
    if (allDone) {
      mutateMedia();
      setTimeout(() => {
        setUploadQueue((prev) => prev.filter((i) => i.status === "error"));
        setActiveTab("browse");
      }, 1500);
    }
  }, [uploadQueue, uploadSingleItem, mutateMedia]);

  // Advanced filter helpers
  const activeFilterCount =
    (advancedFilters.usage !== "all" ? 1 : 0) +
    (advancedFilters.documentTypes.size > 0 ? 1 : 0) +
    (advancedFilters.documents.length > 0 ? 1 : 0) +
    (advancedFilters.hasAlt ? 1 : 0) +
    (advancedFilters.hasTitle ? 1 : 0) +
    (advancedFilters.hasCaption ? 1 : 0) +
    (advancedFilters.missingAlt ? 1 : 0) +
    selectedTagIds.size;

  const clearAllFilters = useCallback(() => {
    setAdvancedFilters(DEFAULT_ADVANCED_FILTERS);
    setSelectedTagIds(new Set());
    setSearch("");
    setTypeFilter(assetType || "all");
    setSortOption(SORT_OPTIONS[0]);
  }, [assetType]);

  // Loading state
  if (credentialsLoading) {
    return (
      <Dialog
        id="media-browser-dialog"
        header="Select Media"
        onClose={onClose}
        width={3}
      >
        <Box padding={5}>
          <Flex justify="center" align="center" style={{ minHeight: "300px" }}>
            <Spinner />
          </Flex>
        </Box>
      </Dialog>
    );
  }

  const activeUploads = uploadQueue.filter(
    (i) => i.status === "pending" || i.status === "uploading"
  );
  const isUploading = activeUploads.length > 0;

  return (
    <Dialog
      id="media-browser-dialog"
      header={
        <Flex align="center" gap={3}>
          <Text size={2} weight="semibold">
            {activeTab === "upload" ? "Upload Files" : "Select Media"}
          </Text>
        </Flex>
      }
      onClose={onClose}
      width={3}
    >
      <Box style={{ minHeight: "500px", display: "flex", flexDirection: "column" }}>
        {/* Tabs */}
        {allowUpload && (
          <Box padding={2} paddingBottom={0}>
            <TabList space={2}>
              <Tab
                aria-controls="browse-panel"
                id="browse-tab"
                label="Browse"
                onClick={() => setActiveTab("browse")}
                selected={activeTab === "browse"}
              />
              <Tab
                aria-controls="upload-panel"
                id="upload-tab"
                label={
                  stagingItems.length > 0
                    ? `Upload (${stagingItems.length})`
                    : "Upload"
                }
                onClick={() => setActiveTab("upload")}
                selected={activeTab === "upload"}
              />
            </TabList>
          </Box>
        )}

        {/* Browse Tab */}
        <TabPanel
          aria-labelledby="browse-tab"
          id="browse-panel"
          hidden={activeTab !== "browse"}
          style={{ flex: 1, display: activeTab === "browse" ? "flex" : "none", flexDirection: "column" }}
        >
          <Box padding={4} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Stack space={4} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {/* Toolbar */}
              <Flex gap={2} align="center" wrap="wrap">
                <Box style={{ flex: 1 }}>
                  <FilterToolbar
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    onSearch={setSearch}
                    typeFilter={typeFilter}
                    onTypeFilterChange={setTypeFilter}
                    sortOption={sortOption}
                    onSortChange={setSortOption}
                    counts={counts}
                    showViewToggle={true}
                    restrictTypeFilter={assetType}
                  />
                </Box>
                {allowUpload && (
                  <Button
                    icon={AddIcon}
                    text="Upload"
                    mode="ghost"
                    tone="primary"
                    onClick={() => fileInputRef.current?.click()}
                    fontSize={1}
                  />
                )}
              </Flex>

              {/* Filter toggle and active filters */}
              <Flex gap={2} align="center" wrap="wrap">
                <Button
                  icon={TagIcon}
                  text={`Filters${activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}`}
                  mode={showFilters ? "default" : "ghost"}
                  tone={activeFilterCount > 0 ? "primary" : "default"}
                  onClick={() => setShowFilters(!showFilters)}
                  fontSize={1}
                  padding={2}
                />
                {activeFilterCount > 0 && (
                  <Button
                    text="Clear all"
                    mode="bleed"
                    tone="critical"
                    onClick={clearAllFilters}
                    fontSize={0}
                    padding={1}
                  />
                )}
                <Box style={{ flex: 1 }} />
                <Text size={1} muted>
                  {totalCount} {totalCount === 1 ? "item" : "items"}
                </Text>
              </Flex>

              {/* Inline filters */}
              {showFilters && (
                <Card padding={3} radius={2} tone="transparent" border>
                  <Stack space={4}>
                    {/* Tags */}
                    {tags.length > 0 && (
                      <Stack space={2}>
                        <Text size={0} muted weight="medium">
                          Tags
                        </Text>
                        <Flex gap={2} wrap="wrap">
                          {tags.map((tag) => {
                            const isSelected = selectedTagIds.has(tag._id);
                            const colors =
                              TAG_COLORS[tag.color] || TAG_COLORS.gray;
                            return (
                              <Box
                                key={tag._id}
                                onClick={() => {
                                  setSelectedTagIds((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(tag._id)) {
                                      next.delete(tag._id);
                                    } else {
                                      next.add(tag._id);
                                    }
                                    return next;
                                  });
                                }}
                                style={{
                                  cursor: "pointer",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  background: isSelected
                                    ? colors.bg
                                    : "transparent",
                                  border: `1px solid ${isSelected ? colors.text : "var(--card-border-color)"}`,
                                }}
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
                              </Box>
                            );
                          })}
                        </Flex>
                      </Stack>
                    )}

                    {/* Usage filter */}
                    <Stack space={2}>
                      <Text size={0} muted weight="medium">
                        Usage
                      </Text>
                      <Flex gap={2}>
                        {(["all", "inUse", "unused"] as UsageFilter[]).map(
                          (value) => {
                            const labels: Record<UsageFilter, string> = {
                              all: "All",
                              inUse: `In Use (${usageCounts.inUse})`,
                              unused: `Unused (${usageCounts.unused})`,
                            };
                            const isActive = advancedFilters.usage === value;
                            return (
                              <Box
                                key={value}
                                onClick={() =>
                                  setAdvancedFilters((prev) => ({
                                    ...prev,
                                    usage: value,
                                    documentTypes:
                                      value === "inUse"
                                        ? prev.documentTypes
                                        : new Set(),
                                  }))
                                }
                                style={{
                                  cursor: "pointer",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  background: isActive
                                    ? "var(--card-muted-bg-color)"
                                    : "transparent",
                                  border: `1px solid ${isActive ? "var(--card-focus-ring-color)" : "var(--card-border-color)"}`,
                                }}
                              >
                                <Text size={1}>{labels[value]}</Text>
                              </Box>
                            );
                          }
                        )}
                      </Flex>
                    </Stack>

                    {/* Document types (when In Use) */}
                    {advancedFilters.usage === "inUse" &&
                      referencingDocTypes.length > 0 && (
                        <Stack space={2}>
                          <Text size={0} muted weight="medium">
                            Document Types
                          </Text>
                          <Flex gap={2} wrap="wrap">
                            {referencingDocTypes.map((docType) => {
                              const isSelected =
                                advancedFilters.documentTypes.has(docType);
                              return (
                                <Box
                                  key={docType}
                                  onClick={() =>
                                    setAdvancedFilters((prev) => {
                                      const next = new Set(prev.documentTypes);
                                      if (next.has(docType)) {
                                        next.delete(docType);
                                      } else {
                                        next.add(docType);
                                      }
                                      return { ...prev, documentTypes: next };
                                    })
                                  }
                                  style={{
                                    cursor: "pointer",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    background: isSelected
                                      ? "var(--card-muted-bg-color)"
                                      : "transparent",
                                    border: `1px solid ${isSelected ? "var(--card-focus-ring-color)" : "var(--card-border-color)"}`,
                                  }}
                                >
                                  <Flex align="center" gap={2}>
                                    <Checkbox checked={isSelected} readOnly />
                                    <Text size={1}>{docType}</Text>
                                  </Flex>
                                </Box>
                              );
                            })}
                          </Flex>
                        </Stack>
                      )}

                    {/* Document search */}
                    <Stack space={2}>
                      <Text size={0} muted weight="medium">
                        Used In Document
                      </Text>
                      <Box style={{ position: "relative" }}>
                        <TextInput
                          icon={SearchIcon}
                          placeholder="Search documents..."
                          value={documentSearchQuery}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => setDocumentSearchQuery(e.currentTarget.value)}
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
                                        setAdvancedFilters((prev) => ({
                                          ...prev,
                                          documents: [...prev.documents, doc],
                                        }));
                                        setDocumentSearchQuery("");
                                      }}
                                    >
                                      <Stack space={1}>
                                        <Text size={1} textOverflow="ellipsis">
                                          {doc.title}
                                        </Text>
                                        <Text size={0} muted>
                                          {doc._type}
                                        </Text>
                                      </Stack>
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
                        <Flex gap={2} wrap="wrap">
                          {advancedFilters.documents.map((doc) => (
                            <Box
                              key={doc._id}
                              padding={2}
                              style={{
                                background: "var(--card-muted-bg-color)",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                setAdvancedFilters((prev) => ({
                                  ...prev,
                                  documents: prev.documents.filter(
                                    (d) => d._id !== doc._id
                                  ),
                                }))
                              }
                            >
                              <Text size={0}>{doc.title} ×</Text>
                            </Box>
                          ))}
                        </Flex>
                      )}
                    </Stack>

                    {/* Metadata filters */}
                    <Stack space={2}>
                      <Text size={0} muted weight="medium">
                        Metadata
                      </Text>
                      <Flex gap={2} wrap="wrap">
                        {[
                          {
                            key: "hasAlt" as const,
                            label: "Has alt text",
                          },
                          {
                            key: "hasTitle" as const,
                            label: "Has title",
                          },
                          {
                            key: "hasCaption" as const,
                            label: "Has caption",
                          },
                          {
                            key: "missingAlt" as const,
                            label: "Missing alt",
                          },
                        ].map(({ key, label }) => {
                          const isActive = advancedFilters[key];
                          return (
                            <Box
                              key={key}
                              onClick={() =>
                                setAdvancedFilters((prev) => ({
                                  ...prev,
                                  [key]: !prev[key],
                                }))
                              }
                              style={{
                                cursor: "pointer",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                background: isActive
                                  ? "var(--card-muted-bg-color)"
                                  : "transparent",
                                border: `1px solid ${isActive ? "var(--card-focus-ring-color)" : "var(--card-border-color)"}`,
                              }}
                            >
                              <Flex align="center" gap={2}>
                                <Checkbox checked={isActive} readOnly />
                                <Text size={1}>{label}</Text>
                              </Flex>
                            </Box>
                          );
                        })}
                      </Flex>
                    </Stack>
                  </Stack>
                </Card>
              )}

              {/* Asset Grid/List */}
              <Box style={{ flex: 1, overflowY: "auto", minHeight: "300px" }}>
                {isLoading ? (
                  <Flex
                    justify="center"
                    align="center"
                    style={{ minHeight: "200px" }}
                  >
                    <Spinner />
                  </Flex>
                ) : media.length === 0 ? (
                  <Card padding={5} radius={2} tone="transparent" border>
                    <Flex
                      direction="column"
                      align="center"
                      justify="center"
                      style={{ minHeight: "200px" }}
                    >
                      <Stack space={3} style={{ textAlign: "center" }}>
                        <ImageIcon style={{ fontSize: 32, opacity: 0.3 }} />
                        <Text size={1} muted>
                          {search || activeFilterCount > 0
                            ? "No results found. Try adjusting your filters."
                            : "No media assets yet."}
                        </Text>
                        {allowUpload && !search && activeFilterCount === 0 && (
                          <Button
                            icon={AddIcon}
                            text="Upload"
                            tone="primary"
                            onClick={() => fileInputRef.current?.click()}
                            fontSize={1}
                          />
                        )}
                      </Stack>
                    </Flex>
                  </Card>
                ) : viewMode === "grid" ? (
                  <AssetGrid
                    assets={media}
                    tags={tags}
                    selectedId={selectedAsset?._id}
                    onSelect={setSelectedAsset}
                    showCheckboxes={false}
                  />
                ) : (
                  <AssetList
                    assets={media}
                    tags={tags}
                    selectedId={selectedAsset?._id}
                    onSelect={setSelectedAsset}
                    showCheckboxes={false}
                  />
                )}
              </Box>

              {/* Pagination */}
              {totalPages > 1 && (
                <Flex justify="center" align="center" gap={2}>
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
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                  />
                </Flex>
              )}
            </Stack>
          </Box>

          {/* Footer */}
          <Box
            padding={4}
            style={{ borderTop: "1px solid var(--card-border-color)" }}
          >
            <Flex gap={2} justify="flex-end">
              <Button
                text="Cancel"
                mode="ghost"
                onClick={onClose}
                fontSize={1}
              />
              <Button
                text="Select"
                tone="primary"
                disabled={!selectedAsset}
                onClick={() => {
                  if (selectedAsset) {
                    onSelect(selectedAsset);
                    onClose();
                  }
                }}
                fontSize={1}
              />
            </Flex>
          </Box>
        </TabPanel>

        {/* Upload Tab */}
        {allowUpload && (
          <TabPanel
            aria-labelledby="upload-tab"
            id="upload-panel"
            hidden={activeTab !== "upload"}
            style={{ flex: 1, display: activeTab === "upload" ? "flex" : "none", flexDirection: "column" }}
          >
            {stagingItems.length > 0 ? (
              <StagingDialog
                items={stagingItems}
                tags={tags}
                onUpdateItem={updateStagingItem}
                onRemoveItem={removeStagingItem}
                onUpload={startUpload}
                onClose={closeStagingDialog}
                embedded
              />
            ) : uploadQueue.length > 0 ? (
              <Box padding={4}>
                <Stack space={4}>
                  <Text size={1} weight="semibold">
                    {isUploading
                      ? `Uploading ${activeUploads.length} file${activeUploads.length > 1 ? "s" : ""}...`
                      : "Upload complete"}
                  </Text>
                  <Stack space={2}>
                    {uploadQueue.map((item) => (
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
              </Box>
            ) : (
              <Box padding={4}>
                <Card
                  padding={5}
                  radius={2}
                  tone="transparent"
                  border
                  style={{ cursor: "pointer" }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    style={{ minHeight: "200px" }}
                  >
                    <Stack space={3} style={{ textAlign: "center" }}>
                      <AddIcon style={{ fontSize: 32, opacity: 0.5 }} />
                      <Text size={1} muted>
                        Click to select files or drag and drop
                      </Text>
                      <Text size={0} muted>
                        {assetType === "image"
                          ? "Supports images"
                          : assetType === "video"
                            ? "Supports videos"
                            : "Supports images and videos"}
                      </Text>
                    </Stack>
                  </Flex>
                </Card>
              </Box>
            )}
          </TabPanel>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={
            assetType === "image"
              ? "image/*"
              : assetType === "video"
                ? "video/*"
                : "image/*,video/*"
          }
          multiple
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </Box>
    </Dialog>
  );
}
