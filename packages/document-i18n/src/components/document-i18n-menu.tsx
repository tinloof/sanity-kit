import {TranslateIcon} from "@sanity/icons";
import {
  Box,
  Button,
  Card,
  Popover,
  Stack,
  Text,
  TextInput,
  useClickOutside,
} from "@sanity/ui";
import {uuid} from "@sanity/uuid";
import {type FormEvent, useCallback, useMemo, useState} from "react";
import {useEditState} from "sanity";

import {useTranslationMetadata} from "../hooks/use-locale-metadata";
import type {DocumentI18nMenuProps} from "../types";
import {useDocumentI18nContext} from "./document-i18n-context";
import Warning from "./warning";
import LocaleOption from "./locale-option";
import LocalePatch from "./locale-patch";
import LocaleManage from "./locale-manage";

export function DocumentI18nMenu(props: DocumentI18nMenuProps) {
  const {documentId} = props;
  const schemaType = props.schemaType;
  const {localeField, locales} = useDocumentI18nContext();

  // Search filter query
  const [query, setQuery] = useState(``);
  const handleQuery = useCallback((event: FormEvent<HTMLInputElement>) => {
    if (event.currentTarget.value) {
      setQuery(event.currentTarget.value);
    } else {
      setQuery(``);
    }
  }, []);

  // UI Handlers
  const [open, setOpen] = useState(false);
  const handleClick = useCallback(() => setOpen((o) => !o), []);
  const [button, setButton] = useState<HTMLElement | null>(null);
  const [popover, setPopover] = useState<HTMLElement | null>(null);
  const handleClickOutside = useCallback(() => setOpen(false), []);
  useClickOutside(handleClickOutside, [button, popover]);

  // Get metadata from content lake
  const {data, loading, error} = useTranslationMetadata(documentId);
  const metadata = Array.isArray(data) && data.length ? data[0] : null;

  // Optimistically set a metadata ID for a newly created metadata document
  // Cannot rely on generated metadata._id from useTranslationMetadata
  // As the document store might not have returned it before creating another translation
  const metadataId = useMemo(() => {
    if (loading) {
      return null;
    }

    // Once created, these two values should be the same anyway
    return metadata?._id ?? uuid();
  }, [loading, metadata?._id]);

  // Duplicate a new locale version from the most recent version of this document
  const {draft, published} = useEditState(documentId, schemaType.name);
  const source = draft || published;

  // Check for data issues
  const documentIsInOneMetadataDocument = useMemo(() => {
    return Array.isArray(data) && data.length <= 1;
  }, [data]);
  const sourceLocaleId = source?.[localeField] as string | undefined;
  const sourceLocaleIsValid = locales.some((l) => l.id === sourceLocaleId);
  const allLocalesAreValid = useMemo(() => {
    const valid = locales.every((l) => l.id && l.title);
    if (!valid) {
      console.warn(
        `Not all locales are valid. It should be an array of objects with an "id" and "title" property. Or a function that returns an array of objects with an "id" and "title" property.`,
        locales,
      );
    }

    return valid;
  }, [locales]);

  const content = (
    <Box padding={1}>
      {error ? (
        <Card tone="critical" padding={1}>
          <Text>There was an error returning translations metadata</Text>
        </Card>
      ) : (
        <Stack space={1}>
          <LocaleManage
            id={metadata?._id}
            documentId={documentId}
            metadataId={metadataId}
            schemaType={schemaType}
            sourceLocaleId={sourceLocaleId}
          />
          {locales.length > 4 ? (
            <TextInput
              onChange={handleQuery}
              value={query}
              placeholder="Filter locales"
            />
          ) : null}
          {locales.length > 0 ? (
            <>
              {/* Once metadata is loaded, there may be issues */}
              {loading ? null : (
                <>
                  {/* Not all locales are valid */}
                  {data && documentIsInOneMetadataDocument ? null : (
                    <Warning>
                      {/* TODO: Surface these documents to the user */}
                      This document has been found in more than one Translations
                      Metadata documents
                    </Warning>
                  )}
                  {/* Not all locales are valid */}
                  {allLocalesAreValid ? null : (
                    <Warning>
                      Not all locale objects are valid. See the console.
                    </Warning>
                  )}
                  {/* Current document has no locale field */}
                  {sourceLocaleId ? null : (
                    <Warning>
                      Choose a locale to apply to <strong>this document</strong>
                    </Warning>
                  )}
                  {/* Current document has an invalid locale field */}
                  {sourceLocaleId && !sourceLocaleIsValid ? (
                    <Warning>
                      Select a supported locale. Current locale value:{" "}
                      <code>{sourceLocaleId}</code>
                    </Warning>
                  ) : null}
                </>
              )}
              {locales
                .filter((locale) => {
                  if (query) {
                    return locale.title
                      .toLowerCase()
                      .includes(query.toLowerCase());
                  }
                  return true;
                })
                .map((locale) =>
                  !loading && sourceLocaleId && sourceLocaleIsValid ? (
                    // Button to duplicate this document to a new translation
                    // And either create or update the metadata document
                    <LocaleOption
                      key={locale.id}
                      locale={locale}
                      schemaType={schemaType}
                      documentId={documentId}
                      disabled={loading || !allLocalesAreValid}
                      current={locale.id === sourceLocaleId}
                      metadata={metadata}
                      metadataId={metadataId}
                      source={source}
                      sourceLocaleId={sourceLocaleId}
                    />
                  ) : (
                    // Button to set a locale field on *this* document
                    <LocalePatch
                      key={locale.id}
                      source={source}
                      locale={locale}
                      // Only allow locale patch change to:
                      // - Keys not in metadata
                      // - The key of this document in the metadata
                      disabled={
                        (loading ||
                          !allLocalesAreValid ||
                          metadata?.translations
                            .filter((t) => t?.value?._ref !== documentId)
                            .some((t) => t._key === locale.id)) ??
                        false
                      }
                    />
                  ),
                )}
            </>
          ) : null}
        </Stack>
      )}
    </Box>
  );

  const issueWithTranslations =
    !loading && sourceLocaleId && !sourceLocaleIsValid;

  if (!documentId) {
    return null;
  }

  if (!schemaType || !schemaType.name) {
    return null;
  }

  return (
    <Popover
      animate
      constrainSize
      content={content}
      open={open}
      portal
      ref={setPopover}
      overflow="auto"
      tone="default"
    >
      <Button
        text="Translations"
        mode="bleed"
        label="Translations"
        disabled={!source}
        tone={
          !source || loading || !issueWithTranslations ? undefined : `caution`
        }
        padding={2}
        icon={() => <TranslateIcon />}
        onClick={handleClick}
        ref={setButton}
        selected={open}
      />
    </Popover>
  );
}
