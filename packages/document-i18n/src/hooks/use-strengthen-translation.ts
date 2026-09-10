import {useToast} from "@sanity/ui/toast";
import {useEffect} from "react";
import {useClient} from "sanity";
import {useDocumentI18nContext} from "../components/document-i18n-context";
import type {Metadata} from "../types";

export function useStrengthenTranslation(
	metadata: Metadata | null,
	documentId: string,
	localeId: string | undefined,
	isPublished: boolean,
) {
	const {apiVersion, weakReferences} = useDocumentI18nContext();
	const client = useClient({apiVersion});
	const toast = useToast();
	const reference = metadata?.translations.find(
		(item) => item._key === localeId && item.value?._ref === documentId,
	);
	const shouldStrengthen =
		!weakReferences &&
		isPublished &&
		Boolean(reference?.value?._weak && reference.value._strengthenOnPublish);
	const metadataId = metadata?._id;
	const revision = metadata?._rev;

	useEffect(() => {
		if (!shouldStrengthen || !metadataId || !revision || !localeId) return;
		const path = `translations[_key==${JSON.stringify(localeId)}].value`;
		// A concurrent unlink or reference replacement must not be overwritten.
		client
			.patch(metadataId)
			.ifRevisionId(revision)
			.unset([`${path}._weak`, `${path}._strengthenOnPublish`])
			.commit()
			.catch((error) => {
				// The metadata listener supplies the new revision and retries if still needed.
				if (error.statusCode === 409) return;
				toast.push({
					status: "error",
					title: "Could not strengthen translation reference",
					description: error.message,
				});
			});
	}, [client, toast, shouldStrengthen, metadataId, revision, localeId]);
}
