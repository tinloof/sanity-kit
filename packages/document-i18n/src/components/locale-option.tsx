import {AddIcon, CheckmarkIcon, SplitVerticalIcon} from "@sanity/icons";
import {
  Badge,
  Box,
  Button,
  Flex,
  Spinner,
  Text,
  Tooltip,
  useToast,
} from "@sanity/ui";
import {uuid} from "@sanity/uuid";
import {useCallback, useEffect, useState} from "react";
import {type ObjectSchemaType, type SanityDocument, useClient} from "sanity";

import {METADATA_SCHEMA_NAME} from "../constants";
import {useOpenInNewPane} from "../hooks/use-open-in-new-pane";
import type {
  Locale,
  Metadata,
  MetadataDocument,
  TranslationReference,
} from "../types";
import {createReference} from "../utils/create-reference";
import {removeExcludedPaths} from "../utils/exclude-paths";
import {useDocumentI18nContext} from "./document-i18n-context";

type LocaleOptionProps = {
  locale: Locale;
  schemaType: ObjectSchemaType;
  documentId: string;
  disabled: boolean;
  current: boolean;
  source: SanityDocument | null;
  metadataId: string | null;
  metadata?: Metadata | null;
  sourceLocaleId?: string;
};

export default function LocaleOption(props: LocaleOptionProps) {
  const {
    locale,
    schemaType,
    documentId,
    current,
    source,
    sourceLocaleId,
    metadata,
    metadataId,
  } = props;
  /* When the user has clicked the Create button, the button should be disabled
   * to prevent double-clicks from firing onCreate twice. This creates duplicate
   * translation metadata entries, which editors will not be able to delete */
  const [userHasClicked, setUserHasClicked] = useState(false);
  const disabled =
    props.disabled ||
    userHasClicked ||
    current ||
    !source ||
    !sourceLocaleId ||
    !metadataId;
  const translation: TranslationReference | undefined = metadata?.translations
    .length
    ? metadata.translations.find((t) => t._key === locale.id)
    : undefined;
  const {apiVersion, localeField, weakReferences, callback} =
    useDocumentI18nContext();
  const client = useClient({apiVersion});
  const toast = useToast();

  const open = useOpenInNewPane(translation?.value?._ref, schemaType.name);
  const handleOpen = useCallback(() => open(), [open]);

  /* Once a translation has been created, reset the userHasClicked state to false
   * so they can click on it to navigate to the translation. If a translation already
   * existed when this component was mounted, this will have no effect. */
  const hasTranslation = Boolean(translation);
  useEffect(() => {
    setUserHasClicked(false);
  }, [hasTranslation]);

  const handleCreate = useCallback(async () => {
    if (!source) {
      throw new Error(`Cannot create translation without source document`);
    }

    if (!sourceLocaleId) {
      throw new Error(`Cannot create translation without source locale ID`);
    }

    if (!metadataId) {
      throw new Error(`Cannot create translation without a metadata ID`);
    }
    /* Disable the create button while this request is pending */
    setUserHasClicked(true);

    const transaction = client.transaction();

    // 1. Duplicate source document
    const newTranslationDocumentId = uuid();
    let newTranslationDocument = {
      ...source,
      _id: `drafts.${newTranslationDocumentId}`,
      // 2. Update locale of the translation
      [localeField]: locale.id,
    };

    // Remove fields / paths we don't want to duplicate
    newTranslationDocument = removeExcludedPaths(
      newTranslationDocument,
      schemaType,
    ) as SanityDocument;

    transaction.create(newTranslationDocument);

    // 3. Maybe create the metadata document
    const sourceReference = createReference(
      sourceLocaleId,
      documentId,
      schemaType.name,
      !weakReferences,
    );
    const newTranslationReference = createReference(
      locale.id,
      newTranslationDocumentId,
      schemaType.name,
      !weakReferences,
    );
    const newMetadataDocument: MetadataDocument = {
      _id: metadataId,
      _type: METADATA_SCHEMA_NAME,
      schemaTypes: [schemaType.name],
      translations: [sourceReference],
    };

    transaction.createIfNotExists(newMetadataDocument);

    // 4. Patch translation to metadata document
    // Note: If the document was only just created in the operation above
    // This patch operation will have no effect
    const metadataPatch = client
      .patch(metadataId)
      .setIfMissing({translations: [sourceReference]})
      .insert(`after`, `translations[-1]`, [newTranslationReference]);

    transaction.patch(metadataPatch);

    // 5. Commit!
    transaction
      .commit()
      .then(() => {
        const metadataExisted = Boolean(metadata?._createdAt);

        callback?.({
          client,
          sourceLocaleId,
          sourceDocument: source,
          newDocument: newTranslationDocument,
          destinationLocaleId: locale.id,
          metaDocumentId: metadataId,
        }).catch((err) => {
          toast.push({
            status: "error",
            title: `Callback`,
            description: `Error while running callback - ${err}.`,
          });
        });

        return toast.push({
          status: "success",
          title: `Created "${locale.title}" translation`,
          description: metadataExisted
            ? `Updated Translations Metadata`
            : `Created Translations Metadata`,
        });
      })
      .catch((err) => {
        console.error(err);

        /* Re-enable the create button if there was an error */
        setUserHasClicked(false);

        return toast.push({
          status: "error",
          title: `Error creating translation`,
          description: err.message,
        });
      });
  }, [
    client,
    documentId,
    locale.id,
    locale.title,
    localeField,
    metadata?._createdAt,
    metadataId,
    schemaType,
    source,
    sourceLocaleId,
    toast,
    weakReferences,
    callback,
  ]);

  let message;

  if (current) {
    message = `Current document`;
  } else if (translation) {
    message = `Open ${locale.title} translation`;
  } else if (!translation) {
    message = `Create new ${locale.title} translation`;
  }

  return (
    <Tooltip
      animate
      content={
        <Box padding={2}>
          <Text muted size={1}>
            {message}
          </Text>
        </Box>
      }
      fallbackPlacements={["right", "left"]}
      placement="top"
      portal
    >
      <Button
        onClick={translation ? handleOpen : handleCreate}
        mode={current && disabled ? `default` : `bleed`}
        disabled={disabled}
      >
        <Flex gap={3} align="center">
          {disabled && !current ? (
            <Spinner />
          ) : (
            <Text size={2}>
              {/* eslint-disable-next-line no-nested-ternary */}
              {translation ? (
                <SplitVerticalIcon />
              ) : current ? (
                <CheckmarkIcon />
              ) : (
                <AddIcon />
              )}
            </Text>
          )}
          <Box flex={1}>
            <Text>{locale.title}</Text>
          </Box>
          <Badge tone={disabled || current ? `default` : `primary`}>
            {locale.id}
          </Badge>
        </Flex>
      </Button>
    </Tooltip>
  );
}
