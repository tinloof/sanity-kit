import { EditIcon, EyeOpenIcon, FolderIcon, LockIcon } from "@sanity/icons";
import {
  usePresentationNavigate,
  usePresentationParams,
} from "@sanity/presentation";
import { Box, Button, Card, Flex, Stack, Text, TextInput } from "@sanity/ui";
import { getDocumentPath, stringToPathname } from "@tinloof/sanity-web";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { ObjectFieldProps, set, SlugValue, unset, useFormValue, FormFieldValidationStatus } from "sanity";
import { styled } from "styled-components";

import { DocumentWithLocale, PathnameOptions } from "../types";

const UnlockButton = styled(Button)`
  position: static !important;
  cursor: pointer;
  > span:nth-of-type(2) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }
`;

const FolderText = styled(Text)`
  span {
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
  }
`;

export function PathnameFieldComponent(
  props: ObjectFieldProps<SlugValue>
): JSX.Element {
  const fieldOptions = props.schemaType.options as PathnameOptions | undefined;
  const folderOptions = fieldOptions?.folder ?? { canUnlock: true };
  const i18nOptions = fieldOptions?.i18n ?? {
    enabled: false,
    defaultLocaleId: undefined,
  };
  const document = useFormValue([]) as DocumentWithLocale;
  const {
    inputProps: { onChange, value, readOnly },
    title,
    description,
    validation = [],
  } = props;
  const segments = value?.current?.split("/").slice(0);
  const folder = segments?.slice(0, -1).join("/");
  const slug = segments?.slice(-1)[0] || "";
  const [folderLocked, setFolderLocked] = useState(!!folder);
  const folderCanUnlock = !readOnly && folderOptions.canUnlock;

  const fullPathInputRef = useRef<HTMLInputElement>(null);
  const pathSegmentInputRef = useRef<HTMLInputElement>(null);

  const inputValidationProps = validation.length ? {
    customValidity: validation[0].message,
  } : {};

  const updateFinalSegment = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const segment = stringToPathname(e.currentTarget.value);
      // When updating only the final path segment, we don't allow slashes / sub-paths.
      // User must unlock the folder before doing so.
      const finalValue = [folder, segment]
        .filter((part) => typeof part === "string")
        .join("/");
      runChange(onChange, finalValue);
    },
    [folder, onChange]
  );

  const updateFullPath = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      runChange(onChange, e.currentTarget.value);
    },
    [onChange]
  );

  const unlockFolder: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.preventDefault();
      setFolderLocked(false);
      requestAnimationFrame(() => {
        fullPathInputRef?.current?.focus?.();
      });
    },
    [setFolderLocked, fullPathInputRef]
  );

  const handleBlur: React.FocusEventHandler<HTMLInputElement> =
    useCallback(() => {
      setFolderLocked(!!folder);
    }, [folder, setFolderLocked]);

  const localizedPathname = getDocumentPath(
    {
      ...document,
      locale: i18nOptions.enabled ? document.locale : undefined,
      pathname: value?.current,
    },
    i18nOptions.defaultLocaleId || ""
  );

  const pathInput = useMemo(() => {
    if (folderLocked && folder) {
      return (
        <Flex gap={1} align="center">
          <Card
            paddingLeft={2}
            paddingRight={1}
            paddingY={1}
            border
            radius={1}
            tone="transparent"
            style={{ position: "relative" }}
          >
            <Flex gap={2} align="center">
              <Text muted>
                <FolderIcon />
              </Text>
              <FolderText muted>{folder}</FolderText>
              <UnlockButton
                icon={folderCanUnlock ? EditIcon : LockIcon}
                onClick={unlockFolder}
                title={
                  folderCanUnlock
                    ? "Edit path's folder"
                    : "Folder is locked and cannot be changed"
                }
                mode="bleed"
                tone="primary"
                padding={2}
                fontSize={1}
                disabled={!folderCanUnlock}
              >
                <span />
              </UnlockButton>
            </Flex>
          </Card>
          <Text muted size={2}>
            /
          </Text>
          <Box flex={1}>
            <TextInput
              value={slug}
              onChange={updateFinalSegment}
              ref={pathSegmentInputRef}
              onBlur={handleBlur}
              disabled={readOnly}
              {...inputValidationProps}
            />
          </Box>
          <PreviewButton localizedPathname={localizedPathname || ""} />
        </Flex>
      );
    }

    // If unlocked or no folder, show a plain input for the full path
    return (
      <Flex gap={1} align="center">
        <Box flex={1}>
          <TextInput
            value={value?.current || ""}
            onChange={updateFullPath}
            ref={fullPathInputRef}
            onBlur={handleBlur}
            disabled={readOnly}
            style={{ flex: 1 }}
            {...inputValidationProps}
          />
        </Box>
        <PreviewButton localizedPathname={localizedPathname || ""} />
      </Flex>
    );
  }, [
    folder,
    folderLocked,
    slug,
    readOnly,
    unlockFolder,
    updateFullPath,
    updateFinalSegment,
    handleBlur,
    value,
    localizedPathname,
    folderCanUnlock,
  ]);

  return (
    <Stack space={3}>
      <Stack space={2} flex={1}>
        <Flex align="center" paddingY={1}>
          <Text size={1} weight="semibold">
            {title}
          </Text>
          {validation.length > 0 && (
            <Box marginLeft={2}>
              <FormFieldValidationStatus fontSize={1} placement="top" validation={validation} />
            </Box>
          )}
        </Flex>
        {description && <Text size={1}>{description}</Text>}
      </Stack>

      {typeof value?.current === "string" && (
        <Text muted>
          {window.location.origin}
          {localizedPathname}
        </Text>
      )}

      {pathInput}
    </Stack>
  );
}

function runChange(onChange: (patch) => void, value?: string) {
  // We use stringToPathname to ensure that the value is a valid pathname.
  // We also allow trailing slashes to make it possible to create folders
  const finalValue = value
    ? stringToPathname(value, { allowTrailingSlash: true })
    : undefined;

  onChange(
    typeof value === "string"
      ? set({
          current: finalValue,
          _type: "slug",
        })
      : unset()
  );
}

function PreviewButton({ localizedPathname }: { localizedPathname: string }) {
  const navigate = useSafeNavigate();
  const preview = useSafePreview();

  const handleClick = useCallback(() => {
    if (!navigate || typeof localizedPathname !== "string") {
      return;
    }

    navigate(localizedPathname);
  }, [navigate, localizedPathname]);

  return (
    <Button
      text="Preview"
      fontSize={1}
      height={"100%"}
      mode="default"
      tone="default"
      icon={EyeOpenIcon}
      disabled={
        !navigate ||
        typeof localizedPathname !== "string" ||
        preview === localizedPathname
      }
      title="Preview page"
      onClick={handleClick}
    />
  );
}

function useSafeNavigate() {
  try {
    const navigate = usePresentationNavigate();
    return navigate;
  } catch (e) {
    return null;
  }
}

function useSafePreview() {
  try {
    const presentationParams = usePresentationParams();
    const { preview } = presentationParams;
    return preview;
  } catch (e) {
    return null;
  }
}
