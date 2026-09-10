import {useToast} from "@sanity/ui/toast";
import {useCallback, useState} from "react";
import {useClient} from "sanity";
import type {StorageAdapter} from "../../../adapters";
import {API_VERSION} from "../../../constants";
import {deleteAssets, type StorageAsset} from "../../../delete-assets";
import {
	deleteFile,
	deleteFilePresigned,
	type StorageCredentials,
} from "../../../storage-client";
import type {MediaAsset, Tag} from "../../media-panel/types";

export interface UseBulkSelectionOptions {
	media: MediaAsset[];
	adapter: StorageAdapter;
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
	adapter,
	credentials,
	onDelete,
	onMutate,
}: UseBulkSelectionOptions): UseBulkSelectionResult {
	const client = useClient({apiVersion: API_VERSION});
	const toast = useToast();

	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<"single" | "bulk" | null>(
		null,
	);
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

	const deleteFromStorage = useCallback(
		async (asset: StorageAsset): Promise<boolean> => {
			if (!asset.path) return false;
			if (adapter.presignDelete) {
				await deleteFilePresigned(adapter, asset.path);
			} else if (credentials) {
				await deleteFile(credentials, asset.path);
			} else {
				return false;
			}
			return true;
		},
		[adapter, credentials],
	);

	const confirmDelete = useCallback(
		async (singleAsset?: MediaAsset | null) => {
			const assets =
				deleteTarget === "single" && singleAsset
					? [singleAsset]
					: deleteTarget === "bulk"
						? media.filter((asset) => selectedIds.has(asset._id))
						: [];
			if (!assets.length) {
				closeDeleteDialog();
				return;
			}
			setIsDeleting(true);
			try {
				const failed = await deleteAssets(client, assets, deleteFromStorage);
				toast.push(
					failed.length
						? {
								status: "warning",
								title: "Assets deleted; storage cleanup incomplete",
								description: `Some files may remain in storage. Ask your storage administrator to remove: ${failed.map((asset) => asset.path || asset.originalFilename || asset._id).join(", ")}`,
							}
						: {
								status: "success",
								title:
									assets.length === 1
										? "Asset deleted successfully"
										: `${assets.length} assets deleted successfully`,
							},
				);
				if (deleteTarget === "bulk") setSelectedIds(new Set());
				onDelete?.();
			} catch (error) {
				console.error("Failed to delete assets:", error);
				toast.push({
					status: "error",
					title: "Failed to delete assets",
					description: error instanceof Error ? error.message : "Unknown error",
				});
			} finally {
				setIsDeleting(false);
				closeDeleteDialog();
			}
		},
		[
			deleteTarget,
			selectedIds,
			media,
			client,
			toast,
			onDelete,
			closeDeleteDialog,
			deleteFromStorage,
		],
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
								.setIfMissing({tags: []})
								.append("tags", [
									{_type: "reference", _ref: tag._id, _key: tag._id},
								]),
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
				toast.push({status: "error", title: "Failed to add tag"});
			}
		},
		[client, selectedIds, media, toast, onMutate],
	);

	// Remove tag from all selected items
	const bulkRemoveTag = useCallback(
		async (tag: Tag) => {
			const ids = Array.from(selectedIds);
			try {
				const transaction = client.transaction();
				for (const id of ids) {
					transaction.patch(id, (patch) =>
						patch.unset([`tags[_ref=="${tag._id}"]`]),
					);
				}
				await transaction.commit();
				toast.push({
					status: "success",
					title: `Tag "${tag.name}" removed from ${ids.length} item${ids.length > 1 ? "s" : ""}`,
				});
				onMutate?.();
			} catch (error) {
				toast.push({status: "error", title: "Failed to remove tag"});
			}
		},
		[client, selectedIds, toast, onMutate],
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
