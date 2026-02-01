import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  FilterIcon,
  ImageIcon,
  SearchIcon,
  UploadIcon,
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
import { useCallback, useEffect, useRef, useState } from "react";
import { useClient } from "sanity";
import type { StorageAdapter } from "../../adapters";
import { API_VERSION } from "../../constants";
import { useCredentials } from "../../hooks/use-credentials";
import { handleImageUpload, handleVideoUpload } from "../../upload-handler";
import type {
  AdvancedFilters,
  MediaAsset,
  SortOption,
  TypeFilter,
  UsageFilter,
  ViewMode,
} from "../media-panel/types";
import {
  DEFAULT_ADVANCED_FILTERS,
  PAGE_SIZE,
  SORT_OPTIONS,
  TAG_COLORS,
} from "../media-panel/types";
import { AssetGrid } from "./asset-grid";
import { AssetList } from "./asset-list";
import { FilterToolbar } from "./filter-toolbar";
import { useMediaQuery } from "./hooks/use-media-query";
import { useDocumentSearch, useReferencingDocTypes, useTags } from "./hooks/use-tags";

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
  /** Initial files to stage for upload (will trigger immediate upload) */
  initialFiles?: File[];
}

export function MediaBrowserDialog({
  onSelect,
  onClose,
  adapter,
  assetType,
  allowUpload = true,
  initialFiles,
}: MediaBrowserDialogProps) {
  const client = useClient({ apiVersion: API_VERSION });
  const { credentials, loading: credentialsLoading } = useCredentials(adapter);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  // Data hooks
  const { tags } = useTags();
  const { docTypes: referencingDocTypes } = useReferencingDocTypes({ adapter, assetType });
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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, sortOption, selectedTagIds, advancedFilters]);

  // Handle single file upload
  const uploadFile = useCallback(
    async (file: File) => {
      if (!credentials) return;

      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      try {
        const onProgress = (progress: number) => {
          setUploadProgress(progress);
        };

        let result: { _ref: string };
        const isImage = file.type.startsWith("image/");

        if (isImage) {
          result = await handleImageUpload(
            file,
            adapter,
            credentials,
            client,
            onProgress
          );
        } else {
          result = await handleVideoUpload(
            file,
            adapter,
            credentials,
            client,
            onProgress
          );
        }

        // Auto-select the uploaded asset
        onSelect({ _id: result._ref } as MediaAsset);
        onClose();
      } catch (error) {
        console.error("Upload failed:", error);
        setUploadError(error instanceof Error ? error.message : "Upload failed");
        setIsUploading(false);
      }
    },
    [credentials, adapter, client, onSelect, onClose]
  );

  // Handle initial files
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0 && credentials) {
      // Upload the first file immediately
      uploadFile(initialFiles[0]);
    }
  }, [initialFiles, credentials, uploadFile]);

  // Handle file selection for upload
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      uploadFile(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [uploadFile]
  );

  // Handle asset selection - select and close immediately
  const handleAssetSelect = useCallback(
    (asset: MediaAsset) => {
      onSelect(asset);
      onClose();
    },
    [onSelect, onClose]
  );

  // Advanced filter helpers
  const activeFilterCount =
    (advancedFilters.usage !== "all" ? 1 : 0) +
    (advancedFilters.documentTypes.size > 0 ? 1 : 0) +
    (advancedFilters.documents.length > 0 ? 1 : 0) +
    (advancedFilters.alt !== null ? 1 : 0) +
    (advancedFilters.title !== null ? 1 : 0) +
    (advancedFilters.caption !== null ? 1 : 0) +
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

  // Uploading state
  if (isUploading) {
    return (
      <Dialog
        id="media-browser-dialog"
        header="Uploading..."
        onClose={onClose}
        width={3}
      >
        <Box padding={5}>
          <Stack space={4}>
            <Flex justify="center" align="center" gap={3}>
              <Spinner />
              <Text size={1}>Uploading... {Math.round(uploadProgress)}%</Text>
            </Flex>
            <Box
              style={{
                height: "4px",
                background: "var(--card-border-color)",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <Box
                style={{
                  height: "100%",
                  width: `${uploadProgress}%`,
                  background: "var(--card-focus-ring-color)",
                  transition: "width 0.2s ease",
                }}
              />
            </Box>
          </Stack>
        </Box>
      </Dialog>
    );
  }

  return (
    <Dialog
      id="media-browser-dialog"
      header="Select Media"
      onClose={onClose}
      width={3}
    >
      <Box style={{ height: "70vh", maxHeight: "700px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Box padding={4} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Stack space={4} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
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
                  icon={UploadIcon}
                  text="Upload"
                  mode="ghost"
                  tone="primary"
                  onClick={() => fileInputRef.current?.click()}
                  fontSize={1}
                />
              )}
            </Flex>

            {/* Filter header bar */}
            <Flex gap={2} align="center" wrap="wrap">
              <Button
                icon={FilterIcon}
                text={`Filters${activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}`}
                mode={showFilters ? "default" : "ghost"}
                tone={activeFilterCount > 0 ? "primary" : "default"}
                onClick={() => setShowFilters(!showFilters)}
                fontSize={1}
                padding={2}
              />

              {/* Active filter chips (when collapsed) */}
              {!showFilters && activeFilterCount > 0 && (
                <Flex gap={1} wrap="wrap" style={{ flex: 1 }}>
                  {/* Tag chips */}
                  {Array.from(selectedTagIds).map((tagId) => {
                    const tag = tags.find((t) => t._id === tagId);
                    if (!tag) return null;
                    const colors = TAG_COLORS[tag.color] || TAG_COLORS.gray;
                    return (
                      <Flex
                        key={tagId}
                        align="center"
                        gap={1}
                        onClick={() => {
                          setSelectedTagIds((prev) => {
                            const next = new Set(prev);
                            next.delete(tagId);
                            return next;
                          });
                        }}
                        style={{
                          cursor: "pointer",
                          padding: "2px 6px",
                          borderRadius: "12px",
                          background: colors.bg,
                          border: `1px solid ${colors.text}`,
                          fontSize: "11px",
                        }}
                      >
                        <Text size={0} style={{ color: colors.text }}>{tag.name}</Text>
                        <CloseIcon style={{ fontSize: 10, color: colors.text }} />
                      </Flex>
                    );
                  })}
                  {/* Usage chip */}
                  {advancedFilters.usage !== "all" && (
                    <Flex
                      align="center"
                      gap={1}
                      onClick={() => setAdvancedFilters((prev) => ({ ...prev, usage: "all", documentTypes: new Set() }))}
                      style={{
                        cursor: "pointer",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        background: "var(--card-muted-bg-color)",
                        fontSize: "11px",
                      }}
                    >
                      <Text size={0}>{advancedFilters.usage === "inUse" ? "In Use" : "Unused"}</Text>
                      <CloseIcon style={{ fontSize: 10 }} />
                    </Flex>
                  )}
                  {/* Metadata chips */}
                  {advancedFilters.alt !== null && (
                    <Flex
                      align="center"
                      gap={1}
                      onClick={() => setAdvancedFilters((prev) => ({ ...prev, alt: null }))}
                      style={{
                        cursor: "pointer",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        background: "var(--card-muted-bg-color)",
                        fontSize: "11px",
                      }}
                    >
                      <Text size={0}>{advancedFilters.alt ? "Has alt" : "Missing alt"}</Text>
                      <CloseIcon style={{ fontSize: 10 }} />
                    </Flex>
                  )}
                  {advancedFilters.title !== null && (
                    <Flex
                      align="center"
                      gap={1}
                      onClick={() => setAdvancedFilters((prev) => ({ ...prev, title: null }))}
                      style={{
                        cursor: "pointer",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        background: "var(--card-muted-bg-color)",
                        fontSize: "11px",
                      }}
                    >
                      <Text size={0}>{advancedFilters.title ? "Has title" : "Missing title"}</Text>
                      <CloseIcon style={{ fontSize: 10 }} />
                    </Flex>
                  )}
                  {advancedFilters.caption !== null && (
                    <Flex
                      align="center"
                      gap={1}
                      onClick={() => setAdvancedFilters((prev) => ({ ...prev, caption: null }))}
                      style={{
                        cursor: "pointer",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        background: "var(--card-muted-bg-color)",
                        fontSize: "11px",
                      }}
                    >
                      <Text size={0}>{advancedFilters.caption ? "Has caption" : "Missing caption"}</Text>
                      <CloseIcon style={{ fontSize: 10 }} />
                    </Flex>
                  )}
                  {/* Document chips */}
                  {advancedFilters.documents.map((doc) => (
                    <Flex
                      key={doc._id}
                      align="center"
                      gap={1}
                      onClick={() => setAdvancedFilters((prev) => ({
                        ...prev,
                        documents: prev.documents.filter((d) => d._id !== doc._id),
                      }))}
                      style={{
                        cursor: "pointer",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        background: "var(--card-muted-bg-color)",
                        fontSize: "11px",
                      }}
                    >
                      <Text size={0}>{doc.title}</Text>
                      <CloseIcon style={{ fontSize: 10 }} />
                    </Flex>
                  ))}
                </Flex>
              )}

              {showFilters && <Box style={{ flex: 1 }} />}

              {activeFilterCount > 0 && (
                <Button
                  text="Clear all"
                  mode="bleed"
                  tone="critical"
                  onClick={clearAllFilters}
                  fontSize={0}
                  padding={2}
                />
              )}

              {!showFilters && <Box style={{ flex: activeFilterCount > 0 ? 0 : 1 }} />}

              <Text size={1} muted>
                {totalCount} {totalCount === 1 ? "item" : "items"}
              </Text>
            </Flex>

            {/* Upload error */}
            {uploadError && (
              <Card padding={3} tone="critical" radius={2}>
                <Text size={1}>{uploadError}</Text>
              </Card>
            )}

            {/* Expanded filter panel */}
            {showFilters && (
              <Card padding={3} radius={2} tone="transparent" border>
                <Stack space={4}>
                  {/* Row 1: Tags + Usage side by side */}
                  <Flex gap={4} wrap="wrap">
                    {/* Tags - multi-select pills */}
                    {tags.length > 0 && (
                      <Box style={{ flex: 1, minWidth: "200px" }}>
                        <Stack space={2}>
                          <Text size={0} muted weight="medium">Tags</Text>
                          <Flex gap={2} wrap="wrap">
                            {tags.map((tag) => {
                              const isSelected = selectedTagIds.has(tag._id);
                              const colors = TAG_COLORS[tag.color] || TAG_COLORS.gray;
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
                                    padding: "4px 10px",
                                    borderRadius: "16px",
                                    background: isSelected ? colors.bg : "transparent",
                                    border: `1px solid ${colors.text}`,
                                    boxShadow: isSelected ? `0 0 0 2px ${colors.text}40` : undefined,
                                  }}
                                >
                                  <Text size={1}>{tag.name}</Text>
                                </Box>
                              );
                            })}
                          </Flex>
                        </Stack>
                      </Box>
                    )}

                    {/* Usage - segmented control */}
                    <Box>
                      <Stack space={2}>
                        <Text size={0} muted weight="medium">Usage</Text>
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
                              inUse: `In use (${usageCounts.inUse})`,
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
                                    documentTypes: value === "inUse" ? prev.documentTypes : new Set(),
                                  }))
                                }
                                style={{
                                  cursor: "pointer",
                                  padding: "6px 12px",
                                  background: isActive ? "var(--card-muted-bg-color)" : "transparent",
                                  borderLeft: index > 0 ? "1px solid var(--card-border-color)" : undefined,
                                }}
                              >
                                <Text size={1} weight={isActive ? "medium" : "regular"}>{labels[value]}</Text>
                              </Box>
                            );
                          })}
                        </Flex>
                      </Stack>
                    </Box>
                  </Flex>

                  {/* Row 2: Missing metadata + Document search */}
                  <Flex gap={4} wrap="wrap">
                    {/* Missing metadata - tri-state checkboxes */}
                    <Box>
                      <Stack space={2}>
                        <Text size={0} muted weight="medium">Metadata</Text>
                        <Flex gap={3}>
                          {[
                            { key: "alt" as const, label: "alt text" },
                            { key: "title" as const, label: "title" },
                            { key: "caption" as const, label: "caption" },
                          ].map(({ key, label }) => {
                            const value = advancedFilters[key];
                            // Tri-state: null (no filter) → true (has) → false (missing) → null
                            const nextValue = value === null ? true : value === true ? false : null;
                            const displayLabel = value === true ? `Has ${label}` : value === false ? `Missing ${label}` : label.charAt(0).toUpperCase() + label.slice(1);
                            return (
                              <Flex
                                key={key}
                                align="center"
                                gap={2}
                                onClick={() =>
                                  setAdvancedFilters((prev) => ({
                                    ...prev,
                                    [key]: nextValue,
                                  }))
                                }
                                style={{ cursor: "pointer" }}
                              >
                                <Box
                                  style={{
                                    width: "14px",
                                    height: "14px",
                                    borderRadius: "3px",
                                    border: value === null ? "1.5px solid var(--card-border-color)" : "none",
                                    background: value !== null ? "var(--card-focus-ring-color)" : "transparent",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {value === true && (
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                      <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                  {value === false && (
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                      <path d="M2.5 5H7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                  )}
                                </Box>
                                <Text size={1}>{displayLabel}</Text>
                              </Flex>
                            );
                          })}
                        </Flex>
                      </Stack>
                    </Box>

                    {/* Document search */}
                    <Box style={{ flex: 1, minWidth: "200px" }}>
                      <Stack space={2}>
                        <Text size={0} muted weight="medium">Referenced by document</Text>
                        <Box style={{ position: "relative" }}>
                          <TextInput
                            icon={SearchIcon}
                            placeholder="Search documents..."
                            value={documentSearchQuery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setDocumentSearchQuery(e.currentTarget.value)
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
                                        !advancedFilters.documents.some((d) => d._id === doc._id)
                                    )
                                    .map((doc) => (
                                      <Box
                                        key={doc._id}
                                        padding={2}
                                        style={{ cursor: "pointer", borderRadius: "4px" }}
                                        onClick={() => {
                                          setAdvancedFilters((prev) => ({
                                            ...prev,
                                            documents: [...prev.documents, doc],
                                          }));
                                          setDocumentSearchQuery("");
                                        }}
                                      >
                                        <Stack space={1}>
                                          <Text size={1} textOverflow="ellipsis">{doc.title}</Text>
                                          <Text size={0} muted>{doc._type}</Text>
                                        </Stack>
                                      </Box>
                                    ))}
                                </Stack>
                              ) : (
                                <Box padding={3}>
                                  <Text size={1} muted align="center">No documents found</Text>
                                </Box>
                              )}
                            </Card>
                          )}
                        </Box>
                        {advancedFilters.documents.length > 0 && (
                          <Flex gap={2} wrap="wrap">
                            {advancedFilters.documents.map((doc) => (
                              <Flex
                                key={doc._id}
                                align="center"
                                gap={1}
                                onClick={() =>
                                  setAdvancedFilters((prev) => ({
                                    ...prev,
                                    documents: prev.documents.filter((d) => d._id !== doc._id),
                                  }))
                                }
                                style={{
                                  cursor: "pointer",
                                  padding: "4px 8px",
                                  borderRadius: "12px",
                                  background: "var(--card-muted-bg-color)",
                                }}
                              >
                                <Text size={0}>{doc.title}</Text>
                                <CloseIcon style={{ fontSize: 10 }} />
                              </Flex>
                            ))}
                          </Flex>
                        )}
                      </Stack>
                    </Box>
                  </Flex>
                </Stack>
              </Card>
            )}

            {/* Asset Grid/List */}
            <Box style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
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
                          icon={UploadIcon}
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
                  onSelect={handleAssetSelect}
                  showCheckboxes={false}
                />
              ) : (
                <AssetList
                  assets={media}
                  tags={tags}
                  onSelect={handleAssetSelect}
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

        {/* Hidden file input - single file only */}
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
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </Box>
    </Dialog>
  );
}
