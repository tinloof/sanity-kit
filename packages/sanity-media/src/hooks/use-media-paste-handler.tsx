import { useCallback, useEffect, useState } from "react";
import { useClient } from "sanity";
import type { PortableTextInputProps } from "sanity";
import { API_VERSION } from "../constants";
import type { StorageAdapter } from "../adapters";
import type { StorageCredentials } from "../storage-client";
import type { StagingItem } from "../components/media-panel/types";
import { handleImageUpload, handleVideoUpload } from "../upload-handler";
import { UploadStagingDialog } from "../components/media-panel/components";
import { useTags } from "../components/shared/hooks";

// Helper to create staging item from file
function createStagingItem(file: File): StagingItem {
  const type = file.type.startsWith("video/") ? "video" : "image";
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    file,
    type,
    previewUrl: URL.createObjectURL(file),
    expanded: true,
  };
}

export interface UseMediaPasteHandlerOptions {
  /** Storage adapter */
  adapter: StorageAdapter;
  /** Storage credentials */
  credentials: StorageCredentials | null;
  /**
   * Callback when all uploads complete - receives array of uploaded assets.
   * Called once after all files are uploaded, allowing you to batch insert blocks.
   *
   * @example
   * ```tsx
   * import { randomKey } from '@sanity/util/content';
   *
   * onUploadComplete: (assets) => {
   *   // Create blocks for all uploaded assets
   *   const newBlocks = assets.map(({ assetId, type }) => ({
   *     _type: type === 'video' ? 'r2MediaVideo' : 'r2MediaImage',
   *     _key: randomKey(12),
   *     asset: { _type: 'reference', _ref: assetId },
   *   }));
   *   onChange(set([...value, ...newBlocks]));
   * }
   * ```
   */
  onUploadComplete?: (
    assets: Array<{ assetId: string; type: "image" | "video" }>
  ) => void;
}

export interface UseMediaPasteHandlerResult {
  /** The paste handler to pass to PortableTextInput's onPaste prop */
  onPaste: PortableTextInputProps["onPaste"];
  /** The staging dialog component - render this in your component */
  renderStagingDialog: () => React.ReactNode;
  /** Whether the staging dialog is open */
  isDialogOpen: boolean;
}

/**
 * Hook that provides a paste handler for PortableTextInput that intercepts
 * image and video pastes, shows a staging dialog for upload, and supports
 * multiple files at once.
 *
 * @example
 * ```tsx
 * import { randomKey } from '@sanity/util/content';
 * import { set, PortableTextInput, PortableTextInputProps } from 'sanity';
 * import { useMediaPasteHandler, useCredentials, R2Adapter } from '@tinloof/sanity-media';
 *
 * const adapter = R2Adapter();
 *
 * export function MediaPortableTextInput(props: PortableTextInputProps) {
 *   const { value, onChange } = props;
 *   const { credentials } = useCredentials(adapter);
 *
 *   const { onPaste, renderStagingDialog } = useMediaPasteHandler({
 *     adapter,
 *     credentials,
 *     onUploadComplete: (assets) => {
 *       // Create blocks for all uploaded assets at once
 *       const newBlocks = assets.map(({ assetId, type }) => ({
 *         _type: type === 'video' ? 'r2MediaVideo' : 'r2MediaImage',
 *         _key: randomKey(12),
 *         asset: { _type: 'reference', _ref: assetId },
 *       }));
 *       onChange(set([...(Array.isArray(value) ? value : []), ...newBlocks]));
 *     },
 *   });
 *
 *   return (
 *     <>
 *       <PortableTextInput {...props} onPaste={onPaste} />
 *       {renderStagingDialog()}
 *     </>
 *   );
 * }
 *
 * // Then use it in your schema:
 * // defineField({
 * //   name: 'body',
 * //   type: 'array',
 * //   of: [{ type: 'block' }, { type: 'r2MediaImage' }, { type: 'r2MediaVideo' }],
 * //   components: { input: MediaPortableTextInput },
 * // })
 * ```
 */
export function useMediaPasteHandler(
  options: UseMediaPasteHandlerOptions
): UseMediaPasteHandlerResult {
  const { adapter, credentials, onUploadComplete } = options;
  const client = useClient({ apiVersion: API_VERSION });
  const { tags } = useTags({ adapter });

  const [stagingItems, setStagingItems] = useState<StagingItem[]>([]);
  const [showStagingDialog, setShowStagingDialog] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Custom paste handler that intercepts image and video pastes
  const onPaste: PortableTextInputProps["onPaste"] = useCallback(
    (data: { event: React.ClipboardEvent }) => {
      if (!credentials) return undefined;

      const { event } = data;
      const items = event.clipboardData?.items;

      if (!items) return undefined;

      // Collect all image and video files from clipboard
      const mediaFiles: File[] = [];
      for (const item of items) {
        if (item.type.startsWith("image/") || item.type.startsWith("video/")) {
          const file = item.getAsFile();
          if (file) {
            mediaFiles.push(file);
          }
        }
      }

      // If we found media files, handle them
      if (mediaFiles.length > 0) {
        // Prevent default PTE paste handling
        event.preventDefault();

        // Stage all files for upload
        setStagingItems(mediaFiles.map(createStagingItem));
        setShowStagingDialog(true);

        // Return undefined to signal we handled it
        return Promise.resolve(undefined);
      }

      // Let PTE handle other paste types normally
      return undefined;
    },
    [credentials]
  );

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

    setUploading(true);

    const uploadedAssets: Array<{ assetId: string; type: "image" | "video" }> =
      [];

    // Upload items one by one, updating progress
    for (const item of stagingItems) {
      // Mark item as uploading
      setStagingItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, uploadStatus: "uploading" as const, uploadProgress: 0 }
            : i
        )
      );

      try {
        let assetRef: { _ref: string };

        const progressCallback = (progress: number) => {
          setStagingItems((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, uploadProgress: progress } : i
            )
          );
        };

        if (item.type === "video") {
          assetRef = await handleVideoUpload(
            item.file,
            adapter,
            credentials,
            client,
            progressCallback,
            {
              title: item.title,
              description: item.description,
              tags: item.tags,
            }
          );
        } else {
          assetRef = await handleImageUpload(
            item.file,
            adapter,
            credentials,
            client,
            progressCallback,
            { alt: item.alt, caption: item.caption, tags: item.tags }
          );
        }

        // Mark item as complete
        setStagingItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, uploadStatus: "complete" as const, uploadProgress: 100 }
              : i
          )
        );

        uploadedAssets.push({ assetId: assetRef._ref, type: item.type });
      } catch (err) {
        // Mark item as failed
        setStagingItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  uploadStatus: "error" as const,
                  uploadError:
                    err instanceof Error ? err.message : "Upload failed",
                }
              : i
          )
        );
        console.error("Upload failed for item:", item.file.name, err);
      }
    }

    // Notify caller with all uploaded assets at once
    if (uploadedAssets.length > 0) {
      onUploadComplete?.(uploadedAssets);
    }

    setUploading(false);
  }, [credentials, stagingItems, adapter, client, onUploadComplete]);

  // Auto-close dialog 3 seconds after all uploads complete
  useEffect(() => {
    if (stagingItems.length === 0) return;

    const allDone = stagingItems.every(
      (item) =>
        item.uploadStatus === "complete" || item.uploadStatus === "error"
    );

    if (allDone) {
      const timeout = setTimeout(() => {
        closeStagingDialog();
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [stagingItems, closeStagingDialog]);

  // Render function for staging dialog
  const renderStagingDialog = useCallback(() => {
    if (!showStagingDialog || stagingItems.length === 0) {
      return null;
    }

    return (
      <UploadStagingDialog
        stagingItems={stagingItems}
        tags={tags}
        onClose={closeStagingDialog}
        onStartUpload={startUpload}
        onUpdateItem={updateStagingItem}
        onRemoveItem={removeStagingItem}
        isUploading={uploading}
      />
    );
  }, [
    showStagingDialog,
    stagingItems,
    tags,
    closeStagingDialog,
    startUpload,
    updateStagingItem,
    removeStagingItem,
  ]);

  return {
    onPaste,
    renderStagingDialog,
    isDialogOpen: showStagingDialog,
  };
}
