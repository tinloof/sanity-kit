import { useCallback, useState } from "react";
import { useToast } from "@sanity/ui";
import type { Tag } from "../../media-panel/types";
import { useTags } from "./use-tags";

export interface UseTagEditorResult {
  // Tag data from useTags
  tags: Tag[];
  isLoadingTags: boolean;
  mutateTags: () => void;

  // Editor state
  editingTag: Tag | null;
  isCreatingTag: boolean;
  isSavingTag: boolean;
  newTagName: string;
  newTagColor: string;

  // Editor actions
  setNewTagName: (name: string) => void;
  setNewTagColor: (color: string) => void;
  startCreateTag: () => void;
  startEditTag: (tag: Tag) => void;
  cancelTagEdit: () => void;

  // CRUD actions
  saveTag: () => Promise<void>;
  deleteTag: (tag: Tag) => Promise<void>;
}

export function useTagEditor(): UseTagEditorResult {
  const toast = useToast();
  const {
    tags,
    isLoading: isLoadingTags,
    mutate: mutateTags,
    createTag,
    updateTag,
    deleteTag: deleteTagApi,
  } = useTags();

  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [isSavingTag, setIsSavingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("gray");

  // Start creating a new tag
  const startCreateTag = useCallback(() => {
    setIsCreatingTag(true);
    setEditingTag(null);
    setNewTagName("");
    setNewTagColor("gray");
  }, []);

  // Start editing an existing tag
  const startEditTag = useCallback((tag: Tag) => {
    setEditingTag(tag);
    setNewTagName(tag.name);
    setNewTagColor(tag.color);
    setIsCreatingTag(false);
  }, []);

  // Cancel tag editing/creating
  const cancelTagEdit = useCallback(() => {
    setEditingTag(null);
    setIsCreatingTag(false);
    setNewTagName("");
    setNewTagColor("gray");
  }, []);

  // Save tag (create or update)
  const saveTag = useCallback(async () => {
    if (!newTagName.trim()) return;

    setIsSavingTag(true);
    try {
      if (editingTag) {
        // Update existing tag
        await updateTag(editingTag._id, newTagName.trim(), newTagColor);
        toast.push({ status: "success", title: "Tag updated" });
      } else {
        // Create new tag
        await createTag(newTagName.trim(), newTagColor);
        toast.push({ status: "success", title: `Tag "${newTagName}" created` });
      }
      cancelTagEdit();
    } catch (error) {
      toast.push({
        status: "error",
        title: editingTag ? "Failed to update tag" : "Failed to create tag",
      });
    } finally {
      setIsSavingTag(false);
    }
  }, [editingTag, newTagName, newTagColor, createTag, updateTag, toast, cancelTagEdit]);

  // Delete tag
  const deleteTag = useCallback(
    async (tag: Tag) => {
      try {
        await deleteTagApi(tag._id);
        toast.push({ status: "success", title: `Tag "${tag.name}" deleted` });
      } catch (error) {
        toast.push({ status: "error", title: "Failed to delete tag" });
      }
    },
    [deleteTagApi, toast]
  );

  return {
    tags,
    isLoadingTags,
    mutateTags,
    editingTag,
    isCreatingTag,
    isSavingTag,
    newTagName,
    newTagColor,
    setNewTagName,
    setNewTagColor,
    startCreateTag,
    startEditTag,
    cancelTagEdit,
    saveTag,
    deleteTag,
  };
}
