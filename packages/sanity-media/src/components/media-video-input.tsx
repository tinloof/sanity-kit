import {
  CopyIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  PlayIcon,
  ResetIcon,
  SearchIcon,
  UploadIcon,
} from "@sanity/icons";
import {
  Button,
  Card,
  Flex,
  Menu,
  MenuDivider,
  MenuItem,
  Popover,
  Spinner,
  Stack,
  Text,
  useToast,
} from "@sanity/ui";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  set,
  unset,
  type ObjectInputProps,
  type SanityDocument,
  useClient,
  useFormValue,
} from "sanity";
import { styled } from "styled-components";
import { API_VERSION } from "../constants";
import { useAdapter } from "../context/adapter-context";
import { formatDuration } from "../utils";
import {
  getPendingSelection,
  clearPendingSelection,
} from "../context/selection-context";
import { handleVideoUpload } from "../upload-handler";
import { UploadStagingDialog } from "./media-panel/components";
import type { MediaAsset, StagingItem } from "./media-panel/types";
import { MediaBrowserDialog } from "./shared/media-browser-dialog";
import { useTags } from "./shared/hooks";

// ============================================================================
// Helpers
// ============================================================================

function createStagingItem(file: File, type: "image" | "video"): StagingItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    file,
    type,
    previewUrl: URL.createObjectURL(file),
    expanded: true,
  };
}

// ============================================================================
// Styled Components
// ============================================================================

const RatioBox = styled(Card)`
  position: relative;
  width: 100%;
  min-height: 3.75rem;
  max-height: min(calc(var(--video-height) * 1px), 40vh);
  aspect-ratio: var(--video-width) / var(--video-height);
  background: #000;

  & video {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
  }
`;

const LoadingOverlay = styled(Card)`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(10px);
  background-color: color-mix(in srgb, transparent, var(--card-bg-color) 80%);
`;

const MenuActionsWrapper = styled(Flex)`
  position: absolute;
  top: 0;
  right: 0;
  padding: 8px;
  gap: 4px;
`;

const PlaceholderFlex = styled(Flex)`
  pointer-events: none;
`;

const HiddenInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const UploadButton = styled.label<{ $disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.5em 0.75em;
  border-radius: 0.1875rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};
  background: transparent;
  color: var(--card-fg-color);

  &:hover {
    background: ${(props) =>
      props.$disabled ? "transparent" : "var(--card-bg2-color)"};
  }
`;

const ProgressBar = styled.div`
  height: 4px;
  background-color: var(--card-border-color);
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  width: ${(props) => props.$progress}%;
  height: 100%;
  background-color: var(--card-focus-ring-color);
  transition: width 0.2s ease;
`;

// ============================================================================
// Sub-components
// ============================================================================

function PlaceholderText({
  readOnly,
  hoveringFiles,
}: {
  readOnly?: boolean;
  hoveringFiles?: boolean;
}) {
  const messageText = useMemo(() => {
    if (readOnly) {
      return "Read only";
    }
    if (hoveringFiles) {
      return "Drop to upload";
    }
    return "Drag or paste video here";
  }, [readOnly, hoveringFiles]);

  return (
    <PlaceholderFlex align="center" gap={3} justify="center" paddingLeft={1}>
      <Text muted size={1}>
        <PlayIcon />
      </Text>
      <Text size={1} muted>
        {messageText}
      </Text>
    </PlaceholderFlex>
  );
}

function VideoPreview({
  src,
  poster,
  isLoading,
}: {
  src?: string;
  poster?: string;
  isLoading?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <RatioBox tone="transparent">
      {(isLoading || !loaded) && src && (
        <LoadingOverlay>
          <Spinner />
        </LoadingOverlay>
      )}
      {src && (
        <video
          src={src}
          poster={poster}
          controls
          onLoadedData={() => setLoaded(true)}
        />
      )}
    </RatioBox>
  );
}

function ActionsMenu({
  onUpload,
  onBrowse,
  onClear,
  readOnly,
  downloadUrl,
  copyUrl,
}: {
  onUpload: () => void;
  onBrowse: () => void;
  onClear: () => void;
  readOnly?: boolean;
  downloadUrl?: string;
  copyUrl?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { push: pushToast } = useToast();

  const handleCopyUrl = useCallback(() => {
    if (copyUrl) {
      navigator.clipboard.writeText(copyUrl);
      pushToast({
        closable: true,
        status: "success",
        title: "URL copied to clipboard",
      });
    }
    setIsOpen(false);
  }, [copyUrl, pushToast]);

  return (
    <MenuActionsWrapper>
      <Popover
        content={
          <Menu>
            <MenuItem
              icon={UploadIcon}
              text="Upload"
              onClick={() => {
                setIsOpen(false);
                onUpload();
              }}
              disabled={readOnly}
            />
            <MenuDivider />
            <MenuItem
              icon={SearchIcon}
              text="Browse"
              onClick={() => {
                setIsOpen(false);
                onBrowse();
              }}
              disabled={readOnly}
            />
            {(downloadUrl || copyUrl) && <MenuDivider />}
            {downloadUrl && (
              <MenuItem
                as="a"
                icon={DownloadIcon}
                text="Download"
                href={downloadUrl}
                download
              />
            )}
            {copyUrl && (
              <MenuItem icon={CopyIcon} text="Copy URL" onClick={handleCopyUrl} />
            )}
            <MenuDivider />
            <MenuItem
              tone="critical"
              icon={ResetIcon}
              text="Clear field"
              onClick={() => {
                setIsOpen(false);
                onClear();
              }}
              disabled={readOnly}
            />
          </Menu>
        }
        open={isOpen}
        portal
        placement="bottom-end"
      >
        <Button
          icon={EllipsisVerticalIcon}
          mode="ghost"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open video options"
        />
      </Popover>
    </MenuActionsWrapper>
  );
}

function UploadProgress({
  progress,
  onCancel,
}: {
  progress: number;
  onCancel: () => void;
}) {
  return (
    <Card padding={4} radius={2} border>
      <Stack space={3}>
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={2}>
            <Spinner />
            <Text size={1}>Uploading... {Math.round(progress)}%</Text>
          </Flex>
          <Button
            text="Cancel"
            mode="ghost"
            tone="critical"
            onClick={onCancel}
            fontSize={1}
            padding={3}
          />
        </Flex>
        <ProgressBar>
          <ProgressFill $progress={progress} />
        </ProgressBar>
      </Stack>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function MediaVideoInput(props: ObjectInputProps) {
  const { value, onChange, readOnly, path, schemaType } = props;
  const client = useClient({ apiVersion: API_VERSION });
  const { adapter, credentials, loading: credentialsLoading } = useAdapter();
  const { tags } = useTags({ adapter });

  // Get document info for pending selection handling
  const document = useFormValue([]) as SanityDocument | undefined;
  // Normalize document ID by removing drafts. prefix for consistent matching
  const rawDocumentId = document?._id;
  const documentId = rawDocumentId?.replace(/^drafts\./, "");
  // Build field path with bracket notation for array keys
  const fieldPath = path.reduce<string>((result, segment) => {
    if (typeof segment === "object" && "_key" in segment) {
      return `${result}[_key=="${segment._key}"]`;
    }
    return result ? `${result}.${String(segment)}` : String(segment);
  }, "");

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [assetPreview, setAssetPreview] = useState<MediaAsset | null>(null);
  const [assetLoading, setAssetLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);

  // Staging state for upload with metadata
  const [stagingItems, setStagingItems] = useState<StagingItem[]>([]);
  const [showStagingDialog, setShowStagingDialog] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAbortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const appliedRef = useRef(false);

  // Check for pending selection from media tool navigation (on mount only)
  // Use a small delay to ensure document is ready for editing
  useEffect(() => {
    if (!documentId || appliedRef.current || readOnly) return;

    const pendingAssetId = getPendingSelection(documentId, fieldPath);
    if (pendingAssetId) {
      // Small delay to let the document finish loading
      const timer = setTimeout(() => {
        if (appliedRef.current) return;
        appliedRef.current = true;
        onChange(
          set({
            _type: schemaType?.name || "mediaVideo",
            asset: {
              _type: "reference",
              _ref: pendingAssetId,
            },
          })
        );
        clearPendingSelection(documentId, fieldPath);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [documentId, fieldPath, onChange, schemaType?.name, readOnly]);


  // Load asset preview when we have a reference
  const loadAsset = useCallback(async () => {
    if (value?.asset?._ref) {
      setAssetLoading(true);
      try {
        const asset = await client.getDocument(value.asset._ref);
        setAssetPreview(asset);
      } catch (err) {
        console.error("Failed to load asset:", err);
      } finally {
        setAssetLoading(false);
      }
    } else {
      setAssetPreview(null);
    }
  }, [value?.asset?._ref, client]);

  useEffect(() => {
    loadAsset();
  }, [loadAsset]);

  // Calculate custom properties for aspect ratio
  const customProperties = useMemo(() => {
    const width = assetPreview?.metadata?.dimensions?.width || 1920;
    const height = assetPreview?.metadata?.dimensions?.height || 1080;
    return {
      "--video-width": width,
      "--video-height": height,
    } as CSSProperties;
  }, [assetPreview]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!credentials || readOnly) return;

      const file = e.target.files?.[0];
      if (file && file.type.startsWith("video/")) {
        setStagingItems([createStagingItem(file, "video")]);
        setShowStagingDialog(true);
        // Reset input for re-selection
        e.target.value = "";
      }
    },
    [credentials, readOnly],
  );

  const handleCancelUpload = useCallback(() => {
    uploadAbortRef.current?.abort();
    setUploading(false);
    setProgress(0);
  }, []);

  const handleRemove = useCallback(() => {
    onChange(unset());
    setAssetPreview(null);
  }, [onChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (!credentials || readOnly) return;

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("video/")) {
        setStagingItems([createStagingItem(file, "video")]);
        setShowStagingDialog(true);
      }
    },
    [credentials, readOnly],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (!credentials || readOnly) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("video/")) {
          const file = item.getAsFile();
          if (file) {
            setStagingItems([createStagingItem(file, "video")]);
            setShowStagingDialog(true);
            break;
          }
        }
      }
    },
    [credentials, readOnly],
  );

  const handleBrowseSelect = useCallback(
    (asset: MediaAsset) => {
      onChange(
        set({
          ...value,
          asset: {
            _type: "reference",
            _ref: asset._id,
          },
        }),
      );
      setShowBrowser(false);
    },
    [onChange, value],
  );

  const triggerUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Open media browser dialog
  const handleBrowse = useCallback(() => {
    setShowBrowser(true);
  }, []);

  // Staging dialog handlers
  const closeStagingDialog = useCallback(() => {
    stagingItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setStagingItems([]);
    setShowStagingDialog(false);
  }, [stagingItems]);

  const updateStagingItem = useCallback(
    (id: string, updates: Partial<StagingItem>) => {
      setStagingItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    []
  );

  const removeStagingItem = useCallback((id: string) => {
    setStagingItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
      }
      const remaining = prev.filter((i) => i.id !== id);
      if (remaining.length === 0) {
        setShowStagingDialog(false);
      }
      return remaining;
    });
  }, []);

  const startUpload = useCallback(async () => {
    if (!credentials || stagingItems.length === 0) return;

    const item = stagingItems[0];
    setShowStagingDialog(false);
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const assetRef = await handleVideoUpload(
        item.file,
        adapter,
        credentials,
        client,
        (pct) => setProgress(pct),
        { title: item.title, description: item.description, tags: item.tags }
      );

      onChange(
        set({
          _type: schemaType?.name || "mediaVideo",
          asset: {
            _type: "reference",
            _ref: assetRef._ref,
          },
        })
      );

      // Cleanup
      URL.revokeObjectURL(item.previewUrl);
      setStagingItems([]);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
      }
    } finally {
      setUploading(false);
    }
  }, [credentials, stagingItems, adapter, client, onChange, schemaType?.name]);

  // Loading state
  if (credentialsLoading) {
    return (
      <Card padding={4}>
        <Flex justify="center" align="center">
          <Spinner />
        </Flex>
      </Card>
    );
  }

  // No credentials
  if (!credentials) {
    return (
      <Card padding={4} radius={2} shadow={1} tone="caution">
        <Stack space={2}>
          <Text size={2} weight="semibold">
            Storage Not Configured
          </Text>
          <Text size={1} muted>
            Configure storage credentials in Sanity to enable uploads.
          </Text>
        </Stack>
      </Card>
    );
  }

  // Uploading state
  if (uploading) {
    return <UploadProgress progress={progress} onCancel={handleCancelUpload} />;
  }

  // Has asset
  if (value?.asset?._ref && assetPreview) {
    return (
      <div ref={containerRef}>
      <Stack space={4}>
        <div style={{ padding: 1, ...customProperties }}>
          <Card
            border
            radius={2}
            onPaste={handlePaste}
            style={{ position: "relative", overflow: "hidden" }}
          >
            <VideoPreview
              src={assetPreview.url}
              poster={assetPreview.thumbnail?.url}
              isLoading={assetLoading}
            />
            <ActionsMenu
              onUpload={triggerUpload}
              onBrowse={handleBrowse}
              onClear={handleRemove}
              downloadUrl={assetPreview.url}
              copyUrl={assetPreview.url}
              readOnly={readOnly}
            />
          </Card>
        </div>

        {/* Video info */}
        {assetPreview.metadata?.dimensions && (
          <Flex gap={3} align="center">
            <Text size={0} muted>
              {assetPreview.metadata.dimensions.width} × {assetPreview.metadata.dimensions.height}
            </Text>
            {assetPreview.metadata.duration && (
              <>
                <Text size={0} muted>·</Text>
                <Text size={0} muted>
                  {formatDuration(assetPreview.metadata.duration)}
                </Text>
              </>
            )}
          </Flex>
        )}

        <HiddenInput
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleInputChange}
        />

        {showBrowser && (
          <MediaBrowserDialog
            onSelect={handleBrowseSelect}
            onClose={() => setShowBrowser(false)}
            adapter={adapter}
            assetType="video"
            allowUpload={!readOnly}
          />
        )}

        {showStagingDialog && stagingItems.length > 0 && (
          <UploadStagingDialog
            stagingItems={stagingItems}
            tags={tags}
            onClose={closeStagingDialog}
            onStartUpload={startUpload}
            onUpdateItem={updateStagingItem}
            onRemoveItem={removeStagingItem}
          />
        )}

        {error && (
          <Card padding={3} tone="critical" radius={2}>
            <Text size={1}>{error}</Text>
          </Card>
        )}
      </Stack>
      </div>
    );
  }

  // Empty state - upload placeholder
  return (
    <div ref={containerRef}>
    <Stack space={3}>
      <div style={{ padding: 1 }}>
        <Card
          border
          paddingX={3}
          paddingY={2}
          radius={2}
          tone={isDragging ? "primary" : readOnly ? "transparent" : "inherit"}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          tabIndex={0}
        >
          <Flex align="center" gap={4} justify="space-between">
            <Flex flex={1}>
              <PlaceholderText readOnly={readOnly} hoveringFiles={isDragging} />
            </Flex>

            <Flex align="center" gap={1}>
              <UploadButton htmlFor="media-video-upload" $disabled={readOnly}>
                <UploadIcon />
                <span>Upload</span>
              </UploadButton>
              <HiddenInput
                id="media-video-upload"
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleInputChange}
                disabled={readOnly}
              />

              <Button
                icon={SearchIcon}
                text="Browse"
                mode="bleed"
                onClick={handleBrowse}
                disabled={readOnly}
                fontSize={1}
                padding={3}
              />
            </Flex>
          </Flex>
        </Card>
      </div>

      {showBrowser && (
        <MediaBrowserDialog
          onSelect={handleBrowseSelect}
          onClose={() => setShowBrowser(false)}
          adapter={adapter}
          assetType="video"
          allowUpload={!readOnly}
        />
      )}

      {showStagingDialog && stagingItems.length > 0 && (
        <UploadStagingDialog
          stagingItems={stagingItems}
          tags={tags}
          onClose={closeStagingDialog}
          onStartUpload={startUpload}
          onUpdateItem={updateStagingItem}
          onRemoveItem={removeStagingItem}
        />
      )}

      {error && (
        <Card padding={3} tone="critical" radius={2}>
          <Text size={1}>{error}</Text>
        </Card>
      )}
    </Stack>
    </div>
  );
}
