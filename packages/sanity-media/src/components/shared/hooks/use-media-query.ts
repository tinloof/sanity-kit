import {useMemo} from "react";
import {useClient} from "sanity";
import useSWR from "swr";
import type {StorageAdapter} from "../../../adapters";
import {API_VERSION} from "../../../constants";
import type {
	AdvancedFilters,
	MediaAsset,
	SortOption,
	TypeFilter,
} from "../../media-panel/types";
import {PAGE_SIZE, SORT_OPTIONS} from "../../media-panel/types";

/**
 * Escape special characters in search strings for GROQ match operator.
 * Also limits length to prevent excessively long queries.
 */
function escapeGroqSearch(search: string, maxLength = 100): string {
	// Limit length to prevent abuse
	const trimmed = search.trim().slice(0, maxLength);
	// Escape special GROQ match characters: * ? [ ] \ "
	return trimmed.replace(/[*?[\]\\"/]/g, "\\$&");
}

export interface UseMediaQueryOptions {
	adapter: StorageAdapter;
	typeFilter?: TypeFilter;
	search?: string;
	sortOption?: SortOption;
	selectedTagIds?: Set<string>;
	advancedFilters?: AdvancedFilters;
	page?: number;
	pageSize?: number;
	/** Restrict to specific asset type for input components */
	assetType?: "image" | "video" | "all";
}

export interface UseMediaQueryResult {
	media: MediaAsset[];
	totalCount: number;
	isLoading: boolean;
	counts: {total: number; images: number; videos: number};
	usageCounts: {inUse: number; unused: number};
	mutate: () => void;
}

export function useMediaQuery({
	adapter,
	typeFilter = "all",
	search = "",
	sortOption = SORT_OPTIONS[0],
	selectedTagIds = new Set(),
	advancedFilters,
	page = 1,
	pageSize = PAGE_SIZE,
	assetType = "all",
}: UseMediaQueryOptions): UseMediaQueryResult {
	const client = useClient({apiVersion: API_VERSION});

	// Determine effective type filter based on assetType constraint
	const effectiveTypeFilter: TypeFilter =
		assetType !== "all" ? assetType : typeFilter;

	// Build query key for SWR (memoized to prevent unnecessary re-renders)
	const mediaQueryKey = useMemo(() => {
		let typeCondition: string;
		if (effectiveTypeFilter === "image") {
			typeCondition = `_type == "${adapter.typePrefix}.imageAsset"`;
		} else if (effectiveTypeFilter === "video") {
			typeCondition = `_type == "${adapter.typePrefix}.videoAsset"`;
		} else {
			typeCondition = `_type in ["${adapter.typePrefix}.imageAsset", "${adapter.typePrefix}.videoAsset"]`;
		}

		const escapedSearch = escapeGroqSearch(search);
		const searchCondition = escapedSearch
			? ` && originalFilename match "*${escapedSearch}*"`
			: "";

		// Tag filter condition
		const tagIds = Array.from(selectedTagIds);
		const tagCondition =
			tagIds.length > 0
				? ` && count((tags[]._ref)[@ in [${tagIds
						.map((id) => `"${id}"`)
						.join(",")}]]) == ${tagIds.length}`
				: "";

		// Advanced filter conditions
		const assetTypes = `"${adapter.typePrefix}.imageAsset", "${adapter.typePrefix}.videoAsset"`;
		let usageCondition = "";
		if (advancedFilters?.usage === "inUse") {
			usageCondition = ` && count(*[references(^._id) && !(_type in [${assetTypes}])]) > 0`;
		} else if (advancedFilters?.usage === "unused") {
			usageCondition = ` && count(*[references(^._id) && !(_type in [${assetTypes}])]) == 0`;
		}

		// Document type filter (only applies when usage is "inUse")
		const docTypes = advancedFilters?.documentTypes
			? Array.from(advancedFilters.documentTypes)
			: [];
		const docTypeCondition =
			docTypes.length > 0 && advancedFilters?.usage === "inUse"
				? ` && count(*[_type in [${docTypes
						.map((t) => `"${t}"`)
						.join(",")}] && references(^._id)]) > 0`
				: "";

		// Specific document filter
		const selectedDocIds = advancedFilters?.documents?.map((d) => d._id) || [];
		const documentCondition =
			selectedDocIds.length > 0
				? ` && count(*[_id in [${selectedDocIds
						.map((id) => `"${id}"`)
						.join(",")}] && references(^._id)]) > 0`
				: "";

		// Metadata filters (tri-state: null = no filter, true = has, false = missing)
		const metadataConditions = [
			advancedFilters?.alt === true
				? "(defined(alt) && alt != '')"
				: advancedFilters?.alt === false
					? "(!defined(alt) || alt == '')"
					: null,
			advancedFilters?.title === true
				? "(defined(title) && title != '')"
				: advancedFilters?.title === false
					? "(!defined(title) || title == '')"
					: null,
			advancedFilters?.caption === true
				? "(defined(caption) && caption != '')"
				: advancedFilters?.caption === false
					? "(!defined(caption) || caption == '')"
					: null,
		]
			.filter(Boolean)
			.map((c) => ` && ${c}`)
			.join("");

		const advancedConditions = `${usageCondition}${docTypeCondition}${documentCondition}${metadataConditions}`;

		let orderClause: string;
		const dir = sortOption.direction === "desc" ? "desc" : "asc";
		switch (sortOption.field) {
			case "filename":
				orderClause = `order(originalFilename ${dir})`;
				break;
			case "size":
				orderClause = `order(size ${dir})`;
				break;
			case "date":
			default:
				orderClause = `order(_createdAt ${dir})`;
				break;
		}

		const start = (page - 1) * pageSize;
		const end = start + pageSize;

		// Create a serializable key for SWR
		const advancedFiltersKey = advancedFilters
			? JSON.stringify({
					usage: advancedFilters.usage,
					documentTypes: Array.from(advancedFilters.documentTypes),
					documents: advancedFilters.documents.map((d) => d._id),
					alt: advancedFilters.alt,
					title: advancedFilters.title,
					caption: advancedFilters.caption,
				})
			: "";

		return {
			key: [
				"media",
				adapter.typePrefix,
				effectiveTypeFilter,
				search,
				sortOption.field,
				sortOption.direction,
				page,
				...tagIds,
				advancedFiltersKey,
			] as const,
			query: `{
        "total": count(*[${typeCondition}${searchCondition}${tagCondition}${advancedConditions}]),
        "items": *[${typeCondition}${searchCondition}${tagCondition}${advancedConditions}] | ${orderClause} [${start}...${end}] {
          _id,
          _type,
          _createdAt,
          url,
          originalFilename,
          size,
          mimeType,
          extension,
          metadata,
          tags,
          alt,
          caption,
          title,
          description,
          "thumbnail": thumbnail->{_id, url}
        }
      }`,
		};
	}, [
		adapter.typePrefix,
		effectiveTypeFilter,
		search,
		sortOption.field,
		sortOption.direction,
		page,
		pageSize,
		selectedTagIds,
		advancedFilters,
	]);

	// SWR for media data
	const {
		data: mediaData,
		isLoading,
		mutate: mutateMedia,
	} = useSWR(
		mediaQueryKey.key,
		() =>
			client.fetch<{total: number; items: Omit<MediaAsset, "mediaType">[]}>(
				mediaQueryKey.query,
			),
		{keepPreviousData: true},
	);

	// SWR for counts - filtered by assetType when specified, excludes drafts
	const {data: counts, mutate: mutateCounts} = useSWR(
		["counts", adapter.typePrefix, assetType],
		() => {
			// When assetType is specified, only count that type (excluding drafts)
			if (assetType === "image") {
				return client.fetch<{
					total: number;
					images: number;
					videos: number;
				}>(`{
          "total": count(*[_type == "${adapter.typePrefix}.imageAsset" && !(_id match "drafts.*")]),
          "images": count(*[_type == "${adapter.typePrefix}.imageAsset" && !(_id match "drafts.*")]),
          "videos": 0
        }`);
			} else if (assetType === "video") {
				return client.fetch<{
					total: number;
					images: number;
					videos: number;
				}>(`{
          "total": count(*[_type == "${adapter.typePrefix}.videoAsset" && !(_id match "drafts.*")]),
          "images": 0,
          "videos": count(*[_type == "${adapter.typePrefix}.videoAsset" && !(_id match "drafts.*")])
        }`);
			}
			// Default: count all types (excluding drafts)
			return client.fetch<{total: number; images: number; videos: number}>(`{
        "total": count(*[_type in ["${adapter.typePrefix}.imageAsset", "${adapter.typePrefix}.videoAsset"] && !(_id match "drafts.*")]),
        "images": count(*[_type == "${adapter.typePrefix}.imageAsset" && !(_id match "drafts.*")]),
        "videos": count(*[_type == "${adapter.typePrefix}.videoAsset" && !(_id match "drafts.*")])
      }`);
		},
		{fallbackData: {total: 0, images: 0, videos: 0}},
	);

	// SWR for usage counts - filtered by assetType when specified, excludes drafts
	const {data: usageCounts} = useSWR(
		["usageCounts", adapter.typePrefix, assetType],
		() => {
			const typeCondition =
				assetType === "image"
					? `_type == $imageType && !(_id match "drafts.*")`
					: assetType === "video"
						? `_type == $videoType && !(_id match "drafts.*")`
						: `_type in [$imageType, $videoType] && !(_id match "drafts.*")`;

			return client.fetch<{inUse: number; unused: number}>(
				`{
          "inUse": count(*[${typeCondition} && count(*[references(^._id) && !(_type in [$imageType, $videoType])]) > 0]),
          "unused": count(*[${typeCondition} && count(*[references(^._id) && !(_type in [$imageType, $videoType])]) == 0])
        }`,
				{
					imageType: `${adapter.typePrefix}.imageAsset`,
					videoType: `${adapter.typePrefix}.videoAsset`,
				},
			);
		},
		{fallbackData: {inUse: 0, unused: 0}},
	);

	// Transform media data
	const media = useMemo(
		() =>
			(mediaData?.items ?? []).map((item) => ({
				...item,
				mediaType: item._type.endsWith(".videoAsset") ? "video" : "image",
			})) as MediaAsset[],
		[mediaData?.items],
	);

	const mutate = () => {
		mutateMedia();
		mutateCounts();
	};

	return {
		media,
		totalCount: mediaData?.total ?? 0,
		isLoading: isLoading && !mediaData,
		counts: counts ?? {total: 0, images: 0, videos: 0},
		usageCounts: usageCounts ?? {inUse: 0, unused: 0},
		mutate,
	};
}
