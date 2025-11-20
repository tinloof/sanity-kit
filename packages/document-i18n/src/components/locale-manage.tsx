import {CogIcon} from "@sanity/icons";
import {Box, Button, Stack, Text, Tooltip} from "@sanity/ui";
import {useCallback, useState} from "react";
import {type ObjectSchemaType, useClient} from "sanity";

import {METADATA_SCHEMA_NAME} from "../constants";
import {useOpenInNewPane} from "../hooks/use-open-in-new-pane";
import {createReference} from "../utils/create-reference";
import {useDocumentI18nContext} from "./document-i18n-context";

type LocaleManageProps = {
  id?: string;
  metadataId?: string | null;
  schemaType: ObjectSchemaType;
  documentId: string;
  sourceLocaleId?: string;
};

export default function LocaleManage(props: LocaleManageProps) {
  const {id, metadataId, schemaType, documentId, sourceLocaleId} = props;
  const open = useOpenInNewPane(id, METADATA_SCHEMA_NAME);
  const openCreated = useOpenInNewPane(metadataId, METADATA_SCHEMA_NAME);
  const {allowCreateMetaDoc, apiVersion, weakReferences} =
    useDocumentI18nContext();
  const client = useClient({apiVersion});
  const [userHasClicked, setUserHasClicked] = useState(false);

  const canCreate = !id && Boolean(metadataId) && allowCreateMetaDoc;

  const handleClick = useCallback(() => {
    if (!id && metadataId && sourceLocaleId) {
      /* Disable button while this request is pending */
      setUserHasClicked(true);

      // handle creation of meta document
      const transaction = client.transaction();

      const sourceReference = createReference(
        sourceLocaleId,
        documentId,
        schemaType.name,
        !weakReferences,
      );
      const newMetadataDocument = {
        _id: metadataId,
        _type: METADATA_SCHEMA_NAME,
        schemaTypes: [schemaType.name],
        translations: [sourceReference],
      };

      transaction.createIfNotExists(newMetadataDocument);

      transaction
        .commit()
        .then(() => {
          setUserHasClicked(false);
          openCreated();
        })
        .catch((err) => {
          console.error(err);
          setUserHasClicked(false);
        });
    } else {
      open();
    }
  }, [
    id,
    metadataId,
    sourceLocaleId,
    client,
    documentId,
    schemaType.name,
    weakReferences,
    openCreated,
    open,
  ]);

  const disabled =
    (!id && !canCreate) || (canCreate && !sourceLocaleId) || userHasClicked;

  function ManageButton() {
    return (
      <Stack>
        <Button
          disabled={disabled}
          mode="ghost"
          text="Manage translations"
          icon={CogIcon}
          loading={userHasClicked}
          onClick={handleClick}
        />
      </Stack>
    );
  }

  return (
    <Tooltip
      animate
      content={
        <Box padding={2}>
          <Text muted size={1}>
            Document has no other translations
          </Text>
        </Box>
      }
      fallbackPlacements={["right", "left"]}
      placement="top"
      portal
      disabled={Boolean(id) || canCreate}
    >
      {/* Hidden for now, this opens the translation.metadata document */}
      {/*<ManageButton />*/}
    </Tooltip>
  );
}
