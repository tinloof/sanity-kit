import { useCallback, useEffect, useRef, useState } from "react";
import { useClient } from "sanity";
import type { StorageAdapter } from "../../../adapters";
import { useCredentials } from "../../../hooks/use-credentials";
import { handleImageUpload, handleVideoUpload } from "../../../upload-handler";
import {
  MAX_CONCURRENT_UPLOADS,
  type StagingItem,
  type UploadItem,
} from "../../media-panel/types";

export interface UseUploadQueueOptions {
  adapter: StorageAdapter;
  onUploadComplete?: () => void;
}

export interface UseUploadQueueResult {
  // Upload queue state
  uploadQueue: UploadItem[];
  isUploading: boolean;
  activeUploads: UploadItem[];

  // Staging state
  stagingItems: StagingItem[];
  showStagingDialog: boolean;

  // File input ref
  fileInputRef: React.RefObject<HTMLInputElement | null>;

  // Actions
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  closeStagingDialog: () => void;
  startUpload: () => void;
  updateStagingItem: (id: string, updates: Partial<StagingItem>) => void;
  removeStagingItem: (id: string) => void;
  clearCompletedUploads: () => void;
}

export function useUploadQueue({
  adapter,
  onUploadComplete,
}: UseUploadQueueOptions): UseUploadQueueResult {
  const client = useClient({ apiVersion: "2024-01-01" });
  const { credentials } = useCredentials(adapter);

  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [stagingItems, setStagingItems] = useState<StagingItem[]>([]);
  const [showStagingDialog, setShowStagingDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived state
  const activeUploads = uploadQueue.filter(
    (i) => i.status === "pending" || i.status === "uploading"
  );
  const isUploading = activeUploads.length > 0;

  // Handle file selection
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0 || !credentials) return;

      const newItems: StagingItem[] = Array.from(files)
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
        if (newItems.length > 0) {
          newItems[0].expanded = true;
        }
        setStagingItems(newItems);
        setShowStagingDialog(true);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [credentials]
  );

  // Clean up preview URLs when staging dialog closes
  const closeStagingDialog = useCallback(() => {
    stagingItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setStagingItems([]);
    setShowStagingDialog(false);
  }, [stagingItems]);

  // Start uploading staged items
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
    closeStagingDialog();
  }, [stagingItems, closeStagingDialog]);

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

  // Clear completed uploads
  const clearCompletedUploads = useCallback(() => {
    setUploadQueue((prev) => prev.filter((i) => i.status === "error"));
  }, []);

  // Upload single item
  const uploadSingleItem = useCallback(
    async (item: UploadItem) => {
      if (!credentials) return;

      setUploadQueue((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: "uploading" as const } : i
        )
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
            i.id === item.id
              ? { ...i, status: "completed" as const, progress: 100 }
              : i
          )
        );
      } catch (error) {
        console.error("Upload failed:", error);
        setUploadQueue((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: "error" as const,
                  error: error instanceof Error ? error.message : "Upload failed",
                }
              : i
          )
        );
      }
    },
    [credentials, adapter, client]
  );

  // Upload orchestration effect
  useEffect(() => {
    const pending = uploadQueue.filter((i) => i.status === "pending");
    const uploading = uploadQueue.filter((i) => i.status === "uploading");
    const availableSlots = MAX_CONCURRENT_UPLOADS - uploading.length;

    if (pending.length > 0 && availableSlots > 0) {
      const toStart = pending.slice(0, availableSlots);
      toStart.forEach((item) => uploadSingleItem(item));
    }

    // Refresh lists when all uploads complete
    const allDone =
      uploadQueue.length > 0 &&
      uploadQueue.every((i) => i.status === "completed" || i.status === "error");
    if (allDone) {
      onUploadComplete?.();
      // Clear completed items after a short delay
      setTimeout(() => {
        setUploadQueue((prev) => prev.filter((i) => i.status === "error"));
      }, 2000);
    }
  }, [uploadQueue, uploadSingleItem, onUploadComplete]);

  return {
    uploadQueue,
    isUploading,
    activeUploads,
    stagingItems,
    showStagingDialog,
    fileInputRef,
    handleFileSelect,
    closeStagingDialog,
    startUpload,
    updateStagingItem,
    removeStagingItem,
    clearCompletedUploads,
  };
}
