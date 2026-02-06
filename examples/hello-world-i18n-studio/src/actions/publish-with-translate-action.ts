import type {DocumentActionComponent, DocumentActionsContext} from "sanity";

// =============================================================================
// CONFIGURATION - Customize these values for your project
// =============================================================================

/** The default/source locale that translations originate from */
const DEFAULT_LOCALE = {id: "en", title: "English"};

/** Target locales to translate into when publishing the default locale document */
const TARGET_LOCALES = [
	{id: "fr", title: "French"},
	{id: "es", title: "Spanish"},
	{id: "de", title: "German"},
];

/** The field path where the locale/language is stored on documents */
const LANGUAGE_FIELD_PATH = "locale";

/** The deployed schema ID (get this from `npx sanity schema list`) */
const SCHEMA_ID = "_.schemas.hello-world-i18n";

/** API version for the Sanity client (must be "vX" for Agent Actions) */
const API_VERSION = "vX";

// =============================================================================
// IMPLEMENTATION
// =============================================================================

/**
 * Creates a custom Publish action that triggers AI translations to other locales
 * before delegating to the original Publish behavior.
 *
 * When an editor publishes the default-locale document, this action will:
 * 1. Kick off Agent Actions Translate for each target locale (async, non-blocking)
 * 2. Call the original Publish handler to complete the publish
 *
 * @param originalAction - The built-in Publish action to wrap
 * @param context - The document actions context from Sanity
 * @returns A wrapped Publish action component
 */
export function createPublishWithTranslateAction(
	originalAction: DocumentActionComponent,
	context: DocumentActionsContext
): DocumentActionComponent {
	// Get a client instance that supports Agent Actions
	const client = context.getClient({apiVersion: API_VERSION});

	const PublishWithTranslateAction: DocumentActionComponent = (props) => {
		// Call the original action to get its result (label, icon, onHandle, etc.)
		const originalResult = originalAction(props);

		// If the original action returns null (e.g., not applicable), pass through
		if (!originalResult) {
			return null;
		}

		return {
			...originalResult,
			onHandle: async () => {
				const {id: documentId, type: documentType} = props;

				// Only trigger translations for the default locale document
				// In a document-per-locale model, you might check a locale field here
				// For now, we assume the "base" document (without locale suffix) is the default

				console.log(
					`[PublishWithTranslate] Publishing document: ${documentId} (type: ${documentType})`
				);

				// Kick off translations for each target locale
				for (const targetLocale of TARGET_LOCALES) {
					// Compute a deterministic target document ID for this locale
					const targetDocumentId = `${documentId}-${targetLocale.id}`;

					try {
						console.log(
							`[PublishWithTranslate] Triggering translation: ${DEFAULT_LOCALE.id} -> ${targetLocale.id}`
						);

						// Wait for translation to complete (async: false)
						await client.agent.action.translate({
							schemaId: SCHEMA_ID,
							documentId,
							languageFieldPath: LANGUAGE_FIELD_PATH,
							targetDocument: {
								operation: "createOrReplace",
								_id: targetDocumentId,
							},
							fromLanguage: {
								id: DEFAULT_LOCALE.id,
								title: DEFAULT_LOCALE.title,
							},
							toLanguage: {
								id: targetLocale.id,
								title: targetLocale.title,
							},
						});

						console.log(
							`[PublishWithTranslate] Translation completed for ${targetLocale.id}: ${targetDocumentId}`
						);

						// Publish the translated document
						await client
							.withConfig({apiVersion: "2025-02-19"})
							.action({
								actionType: "sanity.action.document.publish",
								draftId: `drafts.${targetDocumentId}`,
								publishedId: targetDocumentId,
							});

						console.log(
							`[PublishWithTranslate] Published ${targetLocale.id}: ${targetDocumentId}`
						);
					} catch (error) {
						// Log the error but don't block the publish
						console.error(
							`[PublishWithTranslate] Failed to trigger translation for ${targetLocale.id}:`,
							error
						);
					}
				}

				// Delegate to the original publish handler
				if (originalResult.onHandle) {
					await originalResult.onHandle();
				}
			},
		};
	};

	return PublishWithTranslateAction;
}
