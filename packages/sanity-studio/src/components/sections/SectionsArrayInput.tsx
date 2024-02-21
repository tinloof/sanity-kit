import React from "react";

import { AddIcon, SearchIcon } from "@sanity/icons";
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  Stack,
  TextInput,
} from "@sanity/ui";
import { useCallback, useContext, useState } from "react";
import { ArrayOfObjectsInputProps } from "sanity";
import {
  SectionAddHandler,
  SectionType,
  SectionVariantType,
} from "../../types";
import { SectionPicker } from "./SectionPicker";
import { OnItemAdd, SectionsContext } from "./SectionsContext";
import { filterSectionVariants, generateItemKey } from "./utils";

function ArrayFunctions() {
  const { openSectionPicker } = useContext(SectionsContext);

  return (
    <>
      <Button
        text="Add item"
        icon={AddIcon}
        onClick={() => openSectionPicker()}
        mode="ghost"
      />
    </>
  );
}

export function SectionsArrayInput(props: ArrayOfObjectsInputProps) {
  const [open, setOpen] = useState(false);
  const [onItemAdd, setOnItemAdd] = useState<OnItemAdd | null>(null);
  const sections = props.schemaType.of.filter(
    (type) => type?.jsonType === "object"
  ) as SectionType[];
  const sectionVariants: SectionVariantType[] = sections.flatMap((section) => {
    const variants = section.options?.variants;

    if (!Array.isArray(variants) || variants.length === 0) {
      return {
        sectionName: section.name,
        title: section.title || section.name,
      };
    }

    return (
      section.options?.variants?.map((variant) => ({
        sectionName: section.name,
        title: `${section.title || section.name}${
          variant.title ? ` - ${variant.title}` : ""
        }`,
        assetUrl: variant.assetUrl,
        initialValue: variant.initialValue as any,
      })) ?? ([] as SectionVariantType[])
    );
  });

  const [searchQuery, setSearchQuery] = useState("");
  const filteredSectionVariants = filterSectionVariants(
    searchQuery,
    sectionVariants
  );

  const onSectionAdd: SectionAddHandler = ({ sectionName, initialValue }) => {
    setOpen(false);
    const newItem = {
      _key: generateItemKey(),
      _type: sectionName,
      ...(initialValue || {}),
    };

    if (onItemAdd) {
      onItemAdd(newItem);
    } else {
      props.onItemAppend(newItem);
    }
    props.onItemOpen([...props.path, { _key: newItem._key }]);
  };

  const openSectionPicker = useCallback(
    (handleAdd?: OnItemAdd) => {
      setOnItemAdd(() => handleAdd || null);
      setOpen(true);
    },
    [setOnItemAdd, setOpen]
  );

  return (
    <SectionsContext.Provider value={{ openSectionPicker }}>
      {props.renderDefault({
        ...props,
        arrayFunctions: ArrayFunctions,
      })}
      {open && (
        <Dialog
          width={5}
          header={
            <Stack space={2}>
              <Flex align="center" justify="space-between" gap={2}>
                <Heading as="h2" size={1}>
                  Add section
                </Heading>
              </Flex>
              <Box marginTop={4} marginBottom={2} paddingY={1} flex={1}>
                <Card radius={4} tone="transparent">
                  <TextInput
                    aria-label="Search section by name"
                    placeholder="Search section by name"
                    autoComplete="off"
                    border={false}
                    clearButton={false}
                    fontSize={[2, 2, 1]}
                    icon={SearchIcon}
                    radius={2}
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.currentTarget.value)
                    }
                    spellCheck={false}
                  />
                </Card>
              </Box>
            </Stack>
          }
          id="dialog-example"
          onClose={() => setOpen(false)}
          zOffset={1000}
        >
          <SectionPicker
            onSectionAdd={onSectionAdd}
            filteredSectionVariants={filteredSectionVariants}
          />
        </Dialog>
      )}
    </SectionsContext.Provider>
  );
}
