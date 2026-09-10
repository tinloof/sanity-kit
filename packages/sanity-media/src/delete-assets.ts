import type {SanityClient} from "sanity";
import type {MediaAsset} from "./components/media-panel/types";

export type StorageAsset = Pick<
	MediaAsset,
	"_id" | "path" | "originalFilename"
>;

/** Keep referenced files intact if Sanity rejects any document deletion. */
export async function deleteAssets(
	client: Pick<SanityClient, "transaction">,
	assets: MediaAsset[],
	deleteFromStorage: (asset: StorageAsset) => Promise<boolean>,
): Promise<StorageAsset[]> {
	const documents = new Map<string, StorageAsset>();
	for (const asset of assets) {
		if (asset.mediaType === "video" && asset.thumbnail?._id) {
			documents.set(asset.thumbnail._id, {
				...documents.get(asset.thumbnail._id),
				...asset.thumbnail,
			});
		}
		documents.set(asset._id, asset);
	}
	if (!documents.size) return [];

	const transaction = client.transaction();
	for (const id of documents.keys()) transaction.delete(id);
	await transaction.commit();

	// Storage cannot join the Sanity transaction. Report orphaned files so an
	// administrator can clean them up, and attempt every remaining deletion.
	const failed: StorageAsset[] = [];
	const cleanedPaths = new Set<string>();
	for (const asset of documents.values()) {
		if (asset.path && cleanedPaths.has(asset.path)) continue;
		if (asset.path) cleanedPaths.add(asset.path);
		try {
			if (!(await deleteFromStorage(asset))) failed.push(asset);
		} catch {
			failed.push(asset);
		}
	}
	return failed;
}
