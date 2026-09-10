import {TrashIcon} from "@sanity/icons/Trash";
import type {ButtonTone} from "@sanity/ui";
import {useToast} from "@sanity/ui/toast";
import {useCallback, useState} from "react";
import {
	type DocumentActionComponent,
	type SanityDocument,
	useClient,
} from "sanity";

import DeleteTranslationDialog from "../components/delete-translation-dialog";
import DeleteTranslationFooter from "../components/delete-translation-footer";
import {useDocumentI18nContext} from "../components/document-i18n-context";
import {API_VERSION, TRANSLATIONS_ARRAY_NAME} from "../constants";
import type {Metadata} from "../types";

export const DeleteTranslationAction: DocumentActionComponent = (props) => {
	const {id: documentId, published, draft} = props;
	const doc = draft || published;
	const {localeField} = useDocumentI18nContext();

	const [isDialogOpen, setDialogOpen] = useState(false);
	const [translations, setTranslations] = useState<SanityDocument[]>([]);
	const [ready, setReady] = useState(false);
	const [pending, setPending] = useState(false);
	const onClose = useCallback(() => setDialogOpen(false), []);
	const documentLocale = doc ? doc[localeField] : null;

	const toast = useToast();
	const client = useClient({apiVersion: API_VERSION});

	// Unlink the locale first, then allow a separate confirmed deletion.
	const onProceed = useCallback(() => {
		if (!ready || pending) return;
		setPending(true);
		const tx = client.transaction();
		let operation = "DELETE";

		if (documentLocale && translations.length > 0) {
			operation = "UNSET";
			for (const translation of translations) {
				const entries = translation.translations as
					| Metadata["translations"]
					| undefined;
				const paths = (entries ?? [])
					.filter((entry) => entry.value?._ref === documentId)
					.map(
						(entry) =>
							`${TRANSLATIONS_ARRAY_NAME}[_key == ${JSON.stringify(entry._key)}]`,
					);
				if (!translation._rev || paths.length === 0) {
					setPending(false);
					toast.push({
						status: "error",
						title: "Could not verify translation reference",
						description: "Close this dialog and try again.",
					});
					return;
				}
				tx.patch(translation._id, (patch) =>
					patch.ifRevisionId(translation._rev!).unset(paths),
				);
			}
		} else {
			tx.delete(documentId);
			tx.delete(`drafts.${documentId}`);
		}

		tx.commit()
			.then(() => {
				if (operation === "DELETE") {
					onClose();
					props.onComplete();
				}
				toast.push({
					status: "success",
					title:
						operation === "UNSET"
							? "Translation reference unset"
							: "Document deleted",
					description:
						operation === "UNSET" ? "The document can now be deleted" : null,
				});
			})
			.catch((err) => {
				toast.push({
					status: "error",
					title:
						operation === "UNSET"
							? "Failed to unset translation reference"
							: "Failed to delete document",
					description: err.message,
				});
			})
			.finally(() => setPending(false));
	}, [
		client,
		documentLocale,
		translations,
		documentId,
		onClose,
		toast,
		ready,
		pending,
		props.onComplete,
	]);

	return {
		label: `Delete translation...`,
		disabled: !doc || !documentLocale,
		icon: () => <TrashIcon />,
		tone: "critical" as ButtonTone,
		onHandle: () => {
			setDialogOpen(true);
		},
		dialog: isDialogOpen && {
			type: "dialog",
			onClose,
			header: "Delete translation",
			content: doc ? (
				<DeleteTranslationDialog
					doc={doc}
					documentId={documentId}
					setTranslations={setTranslations}
					setReady={setReady}
				/>
			) : null,
			footer: (
				<DeleteTranslationFooter
					disabled={!ready || pending}
					onClose={onClose}
					onProceed={onProceed}
					translations={translations}
				/>
			),
		},
	};
};
