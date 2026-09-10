import {CopyIcon} from "@sanity/icons/Copy";
import {useToast} from "@sanity/ui/toast";
import {uuid} from "@sanity/uuid";
import {useCallback, useMemo, useState} from "react";
import {filter, firstValueFrom} from "rxjs";
import {
	DEFAULT_STUDIO_CLIENT_OPTIONS,
	type DocumentActionComponent,
	type Id,
	InsufficientPermissionsMessage,
	useClient,
	useCurrentUser,
	useDocumentOperation,
	useDocumentPairPermissions,
	useDocumentStore,
	useTranslation,
} from "sanity";
import {useRouter} from "sanity/router";
import {structureLocaleNamespace} from "sanity/structure";
import {useDocumentI18nContext} from "../components/document-i18n-context";
import {METADATA_SCHEMA_NAME, TRANSLATIONS_ARRAY_NAME} from "../constants";
import {useTranslationMetadata} from "../hooks/use-locale-metadata";
import {documentI18nLocaleNamespace} from "../i18n";
import {createReference} from "../utils/create-reference";

const DISABLED_REASON_KEY = {
	METADATA_NOT_FOUND: "action.duplicate.disabled.missing-metadata",
	MULTIPLE_METADATA: "action.duplicate.disabled.multiple-metadata",
	NOTHING_TO_DUPLICATE: "action.duplicate.disabled.nothing-to-duplicate",
	NOT_READY: "action.duplicate.disabled.not-ready",
	// sanity 6 added TARGET_NOT_FOUND to the duplicate operation's disabled union.
	TARGET_NOT_FOUND: "action.duplicate.disabled.target-not-found",
};

export const DuplicateWithTranslationsAction: DocumentActionComponent = ({
	id,
	type,
	onComplete,
}) => {
	const documentStore = useDocumentStore();
	const {weakReferences} = useDocumentI18nContext();
	const {duplicate} = useDocumentOperation(id, type);
	const {navigateIntent} = useRouter();
	const [isDuplicating, setDuplicating] = useState(false);
	const [permissions, isPermissionsLoading] = useDocumentPairPermissions({
		id,
		type,
		permission: "duplicate",
	});
	const {data, loading: isMetadataDocumentLoading} = useTranslationMetadata(id);
	const hasOneMetadataDocument = useMemo(() => {
		return Array.isArray(data) && data.length <= 1;
	}, [data]);
	const metadataDocument = Array.isArray(data) && data.length ? data[0] : null;
	const client = useClient(DEFAULT_STUDIO_CLIENT_OPTIONS);
	const toast = useToast();
	const {t: s} = useTranslation(structureLocaleNamespace);
	const {t: d} = useTranslation(documentI18nLocaleNamespace);
	const currentUser = useCurrentUser();

	const handle = useCallback(async () => {
		setDuplicating(true);

		try {
			if (!metadataDocument) {
				throw new Error("Metadata document not found");
			}

			// 1. Duplicate the document and its localized versions
			const translations = new Map<string, Id>();
			await Promise.all(
				metadataDocument[TRANSLATIONS_ARRAY_NAME].map(async (translation) => {
					const dupeId = uuid();
					const locale = translation._key;
					const docId = translation.value?._ref;

					if (!docId) {
						throw new Error("Translation document not found");
					}

					const {duplicate: duplicateTranslation} = await firstValueFrom(
						documentStore.pair
							.editOperations(docId, type)
							.pipe(filter((op) => op.duplicate.disabled !== "NOT_READY")),
					);

					if (duplicateTranslation.disabled) {
						throw new Error("Cannot duplicate document");
					}

					const duplicateTranslationResult = firstValueFrom(
						documentStore.pair
							.operationEvents(docId, type)
							.pipe(filter((e) => e.op === "duplicate")),
					);
					duplicateTranslation.execute(dupeId);
					const result = await duplicateTranslationResult;
					if (result.type === "error") {
						throw result.error;
					}

					translations.set(locale, dupeId);
				}),
			);

			// Metadata is managed directly; it does not require an editor schema.
			const {_id, _rev, _createdAt, _updatedAt, ...metadataFields} =
				metadataDocument;
			const dupeId = uuid();
			await client
				.transaction()
				.create({
					...metadataFields,
					_id: dupeId,
					_type: METADATA_SCHEMA_NAME,
					translations: metadataDocument.translations.map((translation) => ({
						...translation,
						value: createReference(
							translation._key,
							translations.get(translation._key)!,
							type,
							!weakReferences,
						).value,
					})),
				})
				.commit();

			// 4. Navigate to the duplicated document
			navigateIntent("edit", {
				id: Array.from(translations.values()).at(0),
				type,
			});

			onComplete();
		} catch (error) {
			console.error(error);
			toast.push({
				status: "error",
				title: "Error duplicating document",
				description:
					error instanceof Error
						? error.message
						: "Failed to duplicate document",
			});
		} finally {
			setDuplicating(false);
		}
	}, [
		client,
		documentStore.pair,
		metadataDocument,
		navigateIntent,
		onComplete,
		toast,
		type,
		weakReferences,
	]);

	return useMemo(() => {
		if (!isPermissionsLoading && !permissions?.granted) {
			return {
				icon: () => <CopyIcon />,
				disabled: true,
				label: d("action.duplicate.label"),
				title: (
					<InsufficientPermissionsMessage
						context="duplicate-document"
						currentUser={currentUser}
					/>
				),
			};
		}

		if (!isMetadataDocumentLoading && !metadataDocument) {
			return {
				icon: () => <CopyIcon />,
				disabled: true,
				label: d("action.duplicate.label"),
				title: d(DISABLED_REASON_KEY.METADATA_NOT_FOUND),
			};
		}

		if (!hasOneMetadataDocument) {
			return {
				icon: () => <CopyIcon />,
				disabled: true,
				label: d("action.duplicate.label"),
				title: d(DISABLED_REASON_KEY.MULTIPLE_METADATA),
			};
		}

		return {
			icon: () => <CopyIcon />,
			disabled:
				isDuplicating ||
				Boolean(duplicate.disabled) ||
				isPermissionsLoading ||
				isMetadataDocumentLoading,
			label: isDuplicating
				? s("action.duplicate.running.label")
				: d("action.duplicate.label"),
			title: duplicate.disabled
				? s(DISABLED_REASON_KEY[duplicate.disabled])
				: "",
			onHandle: handle,
		};
	}, [
		currentUser,
		duplicate.disabled,
		handle,
		hasOneMetadataDocument,
		isDuplicating,
		isMetadataDocumentLoading,
		isPermissionsLoading,
		metadataDocument,
		permissions?.granted,
		s,
		d,
	]);
};

DuplicateWithTranslationsAction.action = "duplicate";
DuplicateWithTranslationsAction.displayName = "DuplicateWithTranslationsAction";
