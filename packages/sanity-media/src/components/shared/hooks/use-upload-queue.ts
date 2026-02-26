import { useCallback, useEffect, useRef, useState } from "react";
import { useClient } from "sanity";
import type { StorageAdapter } from "../../../adapters";
import { API_VERSION } from "../../../constants";
import { useCredentials } from "../../../hooks/use-credentials";
import { handleImageUpload, handleVideoUpload } from "../../../upload-handler";
import { type StagingItem } from "../../media-panel/types";

export interface UseUploadQueueOptions {
  adapter: StorageAdapter;
  onUploadComplete?: () => void;
}

export interface UseUploadQueueResult {
  // Upload state
  isUploading: boolean;

  // Staging state
  stagingItems: StagingItem[];
  showStagingDialog: boolean;

  // File input ref
  fileInputRef: React.RefObject<HTMLInputElement | null>;

  // Actions
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  addFiles: (files: FileList | File[]) => void;
  closeStagingDialog: () => void;
  startUpload: () => void;
  updateStagingItem: (id: string, updates: Partial<StagingItem>) => void;
  removeStagingItem: (id: string) => void;
}

export function useUploadQueue({
  adapter,
  onUploadComplete,
}: UseUploadQueueOptions): UseUploadQueueResult {
  const client = useClient({ apiVersion: API_VERSION });
  const { credentials } = useCredentials(adapter);

  const [stagingItems, setStagingItems] = useState<StagingItem[]>([]);
  const [showStagingDialog, setShowStagingDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process files into staging items (shared by file input and drag-drop)
  const processFiles = useCallback(
    (files: FileList | File[]) => {
      if (!credentials) return;

      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      const newItems: StagingItem[] = fileArray
        .filter((file) => {
          const isImage = file.type.startsWith("image/");
          const isVideo = file.type.startsWith("video/");
          return isImage || isVideo;
        })
        .map((file) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          type: file.type.startsWith("image/")
            ? ("image" as const)
            : ("video" as const),
          previewUrl: URL.createObjectURL(file),
          expanded: false,
        }));

      if (newItems.length > 0) {
        // Expand first item by default
        newItems[0].expanded = true;
        setStagingItems(newItems);
        setShowStagingDialog(true);
      }
    },
    [credentials]
  );

  // Handle file selection from input
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      processFiles(files);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFiles]
  );

  // Add files directly (for drag-and-drop)
  const addFiles = useCallback(
    (files: FileList | File[]) => {
      processFiles(files);
    },
    [processFiles]
  );

  // Clean up preview URLs when staging dialog closes
  const closeStagingDialog = useCallback(() => {
    stagingItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setStagingItems([]);
    setShowStagingDialog(false);
  }, [stagingItems]);

  // Start uploading staged items (keeps dialog open, shows progress in dialog)
  const startUpload = useCallback(async () => {
    if (!credentials || stagingItems.length === 0) return;

    setUploading(true);

    // Upload items one by one, updating progress in staging items
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
        const progressCallback = (progress: number) => {
          setStagingItems((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, uploadProgress: progress } : i
            )
          );
        };

        if (item.type === "video") {
          await handleVideoUpload(
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
          await handleImageUpload(
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

    // Notify when all uploads complete
    onUploadComplete?.();
    setUploading(false);
  }, [credentials, stagingItems, adapter, client, onUploadComplete]);

  // Update staging item metadata
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
      const remaining = prev.filter((i) => i.id !== id);
      // Close dialog if no items left
      if (remaining.length === 0) {
        setShowStagingDialog(false);
      }
      return remaining;
    });
  }, []);

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

  return {
    isUploading: uploading,
    stagingItems,
    showStagingDialog,
    fileInputRef,
    handleFileSelect,
    addFiles,
    closeStagingDialog,
    startUpload,
    updateStagingItem,
    removeStagingItem,
  };
}
