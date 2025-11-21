import {EditIcon} from "@sanity/icons";
import {Badge, Box, Button, Flex, Text, useToast} from "@sanity/ui";
import {useCallback} from "react";
import {type SanityDocument, useClient} from "sanity";

import type {Locale} from "../types";
import {useDocumentI18nContext} from "./document-i18n-context";

type LocalePatchProps = {
  locale: Locale;
  source: SanityDocument | null;
  disabled: boolean;
};

export default function LocalePatch(props: LocalePatchProps) {
  const {locale, source} = props;
  const {apiVersion, localeField} = useDocumentI18nContext();
  const disabled = props.disabled || !source;
  const client = useClient({apiVersion});
  const toast = useToast();

  const handleClick = useCallback(() => {
    if (!source) {
      throw new Error(`Cannot patch missing document`);
    }

    const currentId = source._id;

    client
      .patch(currentId)
      .set({[localeField]: locale.id})
      .commit()
      .then(() => {
        toast.push({
          title: `Set document locale to ${locale.title}`,
          status: `success`,
        });
      })
      .catch((err) => {
        console.error(err);

        return toast.push({
          title: `Failed to set document locale to ${locale.title}`,
          status: `error`,
        });
      });
  }, [source, client, localeField, locale, toast]);

  return (
    <Button
      mode="bleed"
      onClick={handleClick}
      disabled={disabled}
      justify="flex-start"
    >
      <Flex gap={3} align="center">
        <Text size={2}>
          <EditIcon />
        </Text>
        <Box flex={1}>
          <Text>{locale.title}</Text>
        </Box>
        <Badge>{locale.id}</Badge>
      </Flex>
    </Button>
  );
}
