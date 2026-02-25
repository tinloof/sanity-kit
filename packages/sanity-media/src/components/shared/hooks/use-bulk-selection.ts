import { useCallback, useState } from "react";
import { useClient } from "sanity";
import { useToast } from "@sanity/ui";
import { API_VERSION } from "../../../constants";
import { deleteFile, getPreviewKey, type StorageCredentials } from "../../../storage-client";
import type { MediaAsset, Tag } from "../../media-panel/types";

export interface UseBulkSelectionOptions {
  media: MediaAsset[];
  credentials: StorageCredentials | null;
  onDelete?: () => void;
  onMutate?: () => void;
}

export interface UseBulkSelectionResult {
  // Selection state
  selectedIds: Set<string>;
  hasSelection: boolean;
  selectionCount: number;

  // Delete dialog state
  deleteDialogOpen: boolean;
  deleteTarget: "single" | "bulk" | null;
  isDeleting: boolean;

  // Selection actions
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  exitSelectionMode: () => void;

  // Delete actions
  openDeleteDialog: (target: "single" | "bulk") => void;
  closeDeleteDialog: () => void;
  confirmDelete: (singleAsset?: MediaAsset | null) => Promise<void>;

  // Bulk tag actions
  bulkAddTag: (tag: Tag) => Promise<void>;
  bulkRemoveTag: (tag: Tag) => Promise<void>;
}

export function useBulkSelection({
  media,
  credentials,
  onDelete,
  onMutate,
}: UseBulkSelectionOptions): UseBulkSelectionResult {
  const client = useClient({ apiVersion: API_VERSION });
  const toast = useToast();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<"single" | "bulk" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Derived state
  const hasSelection = selectedIds.size > 0;
  const selectionCount = selectedIds.size;

  // Toggle selection for a single item
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Select all visible media
  const selectAll = useCallback(() => {
    setSelectedIds(new Set(media.map((m) => m._id)));
  }, [media]);

  // Clear selection
  const exitSelectionMode = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Open delete confirmation dialog
  const openDeleteDialog = useCallback((target: "single" | "bulk") => {
    setDeleteTarget(target);
    setDeleteDialogOpen(true);
  }, []);

  // Close delete confirmation dialog
  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  }, []);

  // Helper to delete file from storage
  const deleteFromStorage = useCallback(
    async (asset: MediaAsset) => {
      if (!credentials || !asset.path) {
        console.warn("Cannot delete from storage: missing credentials or path", {
          hasCredentials: !!credentials,
          path: asset.path,
        });
        return;
      }
      try {
        await deleteFile(credentials, asset.path);
      } catch (error) {
        console.error("Failed to delete from storage:", error);
        // Don't throw - we'll still delete from Sanity even if storage delete fails
        // The file will become orphaned but that's better than leaving a broken reference
      }

      // Also delete preview if it exists (non-blocking)
      try {
        const previewKey = getPreviewKey(asset.path);
        await deleteFile(credentials, previewKey);
      } catch (error) {
        // Only ignore 404 errors (preview doesn't exist for old assets or small images)
        // Log other errors as they may indicate real issues
        const is404 =
          error instanceof Error &&
          (error.message.includes("404") ||
            error.message.includes("NoSuchKey") ||
            error.message.includes("Not Found"));
        if (!is404) {
          console.warn("Failed to delete preview file:", error);
        }
      }
    },
    [credentials]
  );

  // Confirm and execute deletion
  const confirmDelete = useCallback(
    async (singleAsset?: MediaAsset | null) => {
      if (deleteTarget === "single" && singleAsset) {
        setIsDeleting(true);
        try {
          // Delete from storage first
          await deleteFromStorage(singleAsset);

          // Delete thumbnail from storage if it's a video
          if (singleAsset.mediaType === "video" && singleAsset.thumbnail) {
            const thumbnailAsset = singleAsset.thumbnail as MediaAsset & { path?: string };
            if (thumbnailAsset.path && credentials) {
              try {
                await deleteFile(credentials, thumbnailAsset.path);
              } catch (error) {
                console.error("Failed to delete thumbnail from storage:", error);
              }
            }
          }

          const transaction = client.transaction();

          // Delete thumbnail document if it's a video
          if (singleAsset.mediaType === "video" && singleAsset.thumbnail?._id) {
            transaction.delete(singleAsset.thumbnail._id);
          }
          transaction.delete(singleAsset._id);

          await transaction.commit();

          toast.push({
            status: "success",
            title: "Asset deleted successfully",
          });

          onDelete?.();
        } catch (error) {
          console.error("Failed to delete asset:", error);
          toast.push({
            status: "error",
            title: "Failed to delete asset",
            description: error instanceof Error ? error.message : "Unknown error",
          });
        } finally {
          setIsDeleting(false);
        }
      } else if (deleteTarget === "bulk" && selectedIds.size > 0) {
        const count = selectedIds.size;
        setIsDeleting(true);
        try {
          const assetsToDelete = media.filter((m) => selectedIds.has(m._id));

          // Delete all files from storage first
          for (const asset of assetsToDelete) {
            await deleteFromStorage(asset);

            // Delete thumbnail from storage if it's a video
            if (asset.mediaType === "video" && asset.thumbnail) {
              const thumbnailAsset = asset.thumbnail as MediaAsset & { path?: string };
              if (thumbnailAsset.path && credentials) {
                try {
                  await deleteFile(credentials, thumbnailAsset.path);
                } catch (error) {
                  console.error("Failed to delete thumbnail from storage:", error);
                }
              }
            }
          }

          const transaction = client.transaction();

          for (const asset of assetsToDelete) {
            // Delete thumbnail document if it's a video
            if (asset.mediaType === "video" && asset.thumbnail?._id) {
              transaction.delete(asset.thumbnail._id);
            }
            transaction.delete(asset._id);
          }

          await transaction.commit();

          toast.push({
            status: "success",
            title: `${count} asset${count > 1 ? "s" : ""} deleted successfully`,
          });

          setSelectedIds(new Set());
          onDelete?.();
        } catch (error) {
          console.error("Failed to delete assets:", error);
          toast.push({
            status: "error",
            title: "Failed to delete some assets",
            description: error instanceof Error ? error.message : "Unknown error",
          });
        } finally {
          setIsDeleting(false);
        }
      }
      closeDeleteDialog();
    },
    [deleteTarget, selectedIds, media, client, toast, onDelete, closeDeleteDialog, deleteFromStorage, credentials]
  );

  // Add tag to all selected items
  const bulkAddTag = useCallback(
    async (tag: Tag) => {
      const ids = Array.from(selectedIds);
      try {
        const transaction = client.transaction();
        for (const id of ids) {
          const item = media.find((m) => m._id === id);
          const currentTags = item?.tags || [];
          if (!currentTags.some((t) => t._ref === tag._id)) {
            transaction.patch(id, (patch) =>
              patch
                .setIfMissing({ tags: [] })
                .append("tags", [{ _type: "reference", _ref: tag._id, _key: tag._id }])
            );
          }
        }
        await transaction.commit();
        toast.push({
          status: "success",
          title: `Tag "${tag.name}" added to ${ids.length} item${ids.length > 1 ? "s" : ""}`,
        });
        onMutate?.();
      } catch (error) {
        toast.push({ status: "error", title: "Failed to add tag" });
      }
    },
    [client, selectedIds, media, toast, onMutate]
  );

  // Remove tag from all selected items
  const bulkRemoveTag = useCallback(
    async (tag: Tag) => {
      const ids = Array.from(selectedIds);
      try {
        const transaction = client.transaction();
        for (const id of ids) {
          transaction.patch(id, (patch) =>
            patch.unset([`tags[_ref=="${tag._id}"]`])
          );
        }
        await transaction.commit();
        toast.push({
          status: "success",
          title: `Tag "${tag.name}" removed from ${ids.length} item${ids.length > 1 ? "s" : ""}`,
        });
        onMutate?.();
      } catch (error) {
        toast.push({ status: "error", title: "Failed to remove tag" });
      }
    },
    [client, selectedIds, toast, onMutate]
  );

  return {
    selectedIds,
    hasSelection,
    selectionCount,
    deleteDialogOpen,
    deleteTarget,
    isDeleting,
    toggleSelection,
    selectAll,
    exitSelectionMode,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    bulkAddTag,
    bulkRemoveTag,
  };
}
