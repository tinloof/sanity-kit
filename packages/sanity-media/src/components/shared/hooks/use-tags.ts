import { useCallback } from "react";
import { useClient } from "sanity";
import useSWR from "swr";
import type { StorageAdapter } from "../../../adapters";
import { API_VERSION } from "../../../constants";
import type { Tag } from "../../media-panel/types";

export interface UseTagsResult {
  tags: Tag[];
  isLoading: boolean;
  mutate: () => void;
  createTag: (name: string, color: string) => Promise<Tag>;
  updateTag: (id: string, name: string, color: string) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
}

export function useTags(): UseTagsResult {
  const client = useClient({ apiVersion: API_VERSION });

  const {
    data: tags = [],
    isLoading,
    mutate,
  } = useSWR(
    ["tags"],
    () =>
      client.fetch<Tag[]>(
        `*[_type == "media.tag"] | order(name asc) { _id, name, color }`
      ),
    { fallbackData: [] }
  );

  const createTag = useCallback(
    async (name: string, color: string): Promise<Tag> => {
      const newTag = await client.create({
        _type: "media.tag",
        name: name.trim(),
        color,
      });
      mutate();
      return newTag as Tag;
    },
    [client, mutate]
  );

  const updateTag = useCallback(
    async (id: string, name: string, color: string): Promise<void> => {
      await client.patch(id).set({ name: name.trim(), color }).commit();
      mutate();
    },
    [client, mutate]
  );

  const deleteTag = useCallback(
    async (id: string): Promise<void> => {
      await client.delete(id);
      mutate();
    },
    [client, mutate]
  );

  return {
    tags,
    isLoading,
    mutate,
    createTag,
    updateTag,
    deleteTag,
  };
}

export interface UseReferencingDocTypesOptions {
  adapter: StorageAdapter;
}

export function useReferencingDocTypes({
  adapter,
}: UseReferencingDocTypesOptions): {
  docTypes: string[];
  isLoading: boolean;
} {
  const client = useClient({ apiVersion: API_VERSION });

  const { data: docTypes = [], isLoading } = useSWR(
    ["referencingDocTypes", adapter.typePrefix],
    async () => {
      const result = await client.fetch<string[]>(
        `
        array::unique(*[references(*[_type in [$imageType, $videoType]]._id)]._type)
      `,
        {
          imageType: `${adapter.typePrefix}.imageAsset`,
          videoType: `${adapter.typePrefix}.videoAsset`,
        }
      );
      return result.filter(
        (t) =>
          t !== `${adapter.typePrefix}.imageAsset` &&
          t !== `${adapter.typePrefix}.videoAsset`
      );
    },
    { fallbackData: [] }
  );

  return { docTypes, isLoading };
}

export interface UseDocumentSearchOptions {
  adapter: StorageAdapter;
  query: string;
}

export function useDocumentSearch({
  adapter,
  query,
}: UseDocumentSearchOptions): {
  results: Array<{ _id: string; _type: string; title: string }>;
  isLoading: boolean;
} {
  const client = useClient({ apiVersion: API_VERSION });

  const { data: results = [], isLoading } = useSWR(
    query.trim().length >= 2
      ? ["documentSearch", query, adapter.typePrefix]
      : null,
    async () => {
      const res = await client.fetch<Array<{ _id: string; _type: string; title: string }>>(
        `
      *[
        !(_id match "drafts.*") &&
        !(_type in [$imageType, $videoType]) &&
        !(_type match "system.*") &&
        !(_type match "sanity.*") &&
        (title match $searchQuery || name match $searchQuery || _id match $searchQuery)
      ][0...10] {
        _id,
        _type,
        "title": coalesce(title, name, _id)
      }
    `,
        {
          imageType: `${adapter.typePrefix}.imageAsset`,
          videoType: `${adapter.typePrefix}.videoAsset`,
          searchQuery: `*${query.trim()}*`,
        }
      );
      return res;
    },
    { fallbackData: [], keepPreviousData: true }
  );

  return { results, isLoading };
}
