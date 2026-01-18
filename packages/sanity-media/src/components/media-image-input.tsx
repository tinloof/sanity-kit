import {
  CopyIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  ImageIcon,
  ResetIcon,
  SearchIcon,
  UploadIcon,
} from "@sanity/icons";
import {
  Box,
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
import { useRouter } from "sanity/router";
import { styled } from "styled-components";
import { API_VERSION } from "../constants";
import { useAdapter } from "../context/adapter-context";
import {
  getPendingSelection,
  clearPendingSelection,
  type ReturnIntent,
} from "../context/selection-context";
import { MediaBrowserDialog } from "./shared/media-browser-dialog";


// Session storage key for selection context
const SELECTION_CONTEXT_KEY = "media-tool-selection-context";

// ============================================================================
// Styled Components (matching Sanity's native ImageInput)
// ============================================================================

const RatioBox = styled(Card)`
  position: relative;
  width: 100%;
  min-height: 3.75rem;
  max-height: min(calc(var(--image-height) * 1px), 30vh);
  aspect-ratio: var(--image-width) / var(--image-height);

  & img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: scale-down;
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
    return "Drag or paste image here";
  }, [readOnly, hoveringFiles]);

  return (
    <PlaceholderFlex align="center" gap={3} justify="center" paddingLeft={1}>
      <Text muted size={1}>
        <ImageIcon />
      </Text>
      <Text size={1} muted>
        {messageText}
      </Text>
    </PlaceholderFlex>
  );
}

function ImagePreview({
  src,
  alt,
  isLoading,
}: {
  src?: string;
  alt: string;
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
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}
    </RatioBox>
  );
}

function ActionsMenu({
  onUpload,
  onBrowse,
  onClear,
  onDownload,
  onCopyUrl,
  readOnly,
  downloadUrl,
  copyUrl,
}: {
  onUpload: () => void;
  onBrowse: () => void;
  onClear: () => void;
  onDownload?: () => void;
  onCopyUrl?: () => void;
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
          aria-label="Open image options"
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

export function MediaImageInput(props: ObjectInputProps) {
  const { value, onChange, readOnly, path, schemaType } = props;
  const client = useClient({ apiVersion: API_VERSION });
  const router = useRouter();
  const { adapter, credentials, loading: credentialsLoading } = useAdapter();

  // Get document info for selection navigation
  const document = useFormValue([]) as SanityDocument | undefined;
  // Normalize document ID by removing drafts. prefix for consistent matching
  const rawDocumentId = document?._id;
  const documentId = rawDocumentId?.replace(/^drafts\./, "");
  const documentType = document?._type || schemaType?.name || "unknown";
  // Build field path with bracket notation for array keys (required for intent URLs)
  const fieldPath = path.reduce<string>((result, segment) => {
    if (typeof segment === "object" && "_key" in segment) {
      return `${result}[_key=="${segment._key}"]`;
    }
    return result ? `${result}.${String(segment)}` : String(segment);
  }, "");

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [assetPreview, setAssetPreview] = useState<any>(null);
  const [assetLoading, setAssetLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

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
            _type: schemaType?.name || "mediaImage",
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
    const width = assetPreview?.metadata?.dimensions?.width || 400;
    const height = assetPreview?.metadata?.dimensions?.height || 300;
    return {
      "--image-width": width,
      "--image-height": height,
    } as CSSProperties;
  }, [assetPreview]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Open browser dialog with staging instead of direct upload
        setPendingFiles([file]);
        setShowBrowser(true);
        // Reset input for re-selection
        e.target.value = "";
      }
    },
    [],
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
      if (file && file.type.startsWith("image/")) {
        // Open browser dialog with staging instead of direct upload
        setPendingFiles([file]);
        setShowBrowser(true);
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
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            // Open browser dialog with staging instead of direct upload
            setPendingFiles([file]);
            setShowBrowser(true);
            break;
          }
        }
      }
    },
    [credentials, readOnly],
  );

  const handleBrowseSelect = useCallback(
    (asset: any) => {
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

  // Navigate to media tool for browsing
  const handleBrowseNavigation = useCallback(() => {
    if (!documentId) {
      // Fallback to dialog if no document ID
      setShowBrowser(true);
      return;
    }

    // Store selection context in session storage
    // Include the full current URL so we can return to the exact same place
    const selectionContext = {
      returnIntent: {
        documentId,
        documentType,
        fieldPath,
        sourceUrl: window.location.href,
      } as ReturnIntent,
      assetType: "image" as const,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(
      SELECTION_CONTEXT_KEY,
      JSON.stringify(selectionContext)
    );

    // Navigate to media tool
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split("/").filter(Boolean);
    const basePath = pathParts.length > 0 ? `/${pathParts[0]}` : "";
    window.location.href = `${basePath}/media`;
  }, [documentId, documentType, fieldPath]);

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
            style={{ position: "relative" }}
          >
            <ImagePreview
              src={assetPreview.url}
              alt={value.alt || assetPreview.alt || assetPreview.originalFilename || "Image"}
              isLoading={assetLoading}
            />
            <ActionsMenu
              onUpload={triggerUpload}
              onBrowse={handleBrowseNavigation}
              onClear={handleRemove}
              downloadUrl={assetPreview.url}
              copyUrl={assetPreview.url}
              readOnly={readOnly}
            />
          </Card>
        </div>

        <HiddenInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
        />

        {showBrowser && (
          <MediaBrowserDialog
            onSelect={handleBrowseSelect}
            onClose={() => {
              setShowBrowser(false);
              setPendingFiles([]);
            }}
            adapter={adapter}
            assetType="image"
            allowUpload={!readOnly}
            initialFiles={pendingFiles}
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
              <UploadButton htmlFor="media-image-upload" $disabled={readOnly}>
                <UploadIcon />
                <span>Upload</span>
              </UploadButton>
              <HiddenInput
                id="media-image-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                disabled={readOnly}
              />

              <Button
                icon={SearchIcon}
                text="Browse"
                mode="bleed"
                onClick={handleBrowseNavigation}
                disabled={readOnly}
              />
            </Flex>
          </Flex>
        </Card>
      </div>

      {showBrowser && (
        <MediaBrowserDialog
          onSelect={handleBrowseSelect}
          onClose={() => {
            setShowBrowser(false);
            setPendingFiles([]);
          }}
          adapter={adapter}
          assetType="image"
          allowUpload={!readOnly}
          initialFiles={pendingFiles}
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
