import { EditIcon, EyeOpenIcon, FolderIcon, LockIcon } from "@sanity/icons";
import {
  PresentationNavigateContextValue,
  usePresentationNavigate,
  usePresentationParams,
} from "@sanity/presentation";
import { Box, Button, Card, Flex, Stack, Text, TextInput } from "@sanity/ui";
import { getDocumentPath, stringToPathname } from "@tinloof/sanity-web";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { FormFieldValidationStatus, set, unset, useFormValue } from "sanity";
import { styled } from "styled-components";
import { useDebounce, useDebouncedCallback } from "use-debounce";

import { usePathnamePrefix } from "../hooks/usePathnamePrefix";
import {
  DocumentWithLocale,
  PathnameInputProps,
  PathnameOptions,
} from "../types";

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

const pathnameDebounceTime = 1000;

export function PathnameFieldComponent(props: PathnameInputProps): JSX.Element {
  const fieldOptions = props.schemaType.options as PathnameOptions | undefined;
  const { prefix } = usePathnamePrefix(props);
  const folderOptions = fieldOptions?.folder ?? { canUnlock: true };
  const i18nOptions = fieldOptions?.i18n ?? {
    enabled: false,
    defaultLocaleId: undefined,
    localizePathname: undefined,
  };
  const autoNavigate = fieldOptions?.autoNavigate ?? false;
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

  const navigate = useSafeNavigate();
  const preview = useSafePreview();
  const debouncedNavigate = useDebouncedCallback((newPreview?: string) => {
    if (navigate) {
      navigate(newPreview);
    }
  }, pathnameDebounceTime);

  const localizedPathname = getDocumentPath(
    {
      ...document,
      locale: i18nOptions.enabled ? document.locale : undefined,
      pathname: value?.current,
    },
    i18nOptions.defaultLocaleId || "",
    i18nOptions.localizePathname
  );
  const [debouncedLocalizedPathname] = useDebounce(
    localizedPathname,
    pathnameDebounceTime
  );

  const fullPathInputRef = useRef<HTMLInputElement>(null);
  const pathSegmentInputRef = useRef<HTMLInputElement>(null);

  const inputValidationProps = useMemo(
    () =>
      validation.length
        ? {
            customValidity: validation[0].message,
          }
        : {},
    [validation]
  );

  const updateFinalSegment = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const segment = stringToPathname(e.currentTarget.value);
      // When updating only the final path segment, we don't allow slashes / sub-paths.
      // User must unlock the folder before doing so.
      const finalValue = [folder, segment]
        .filter((part) => typeof part === "string")
        .join("/");

      runChange({
        onChange,
        value: finalValue,
        document,
        i18nOptions,
        prevLocalizedPathname: debouncedLocalizedPathname,
        preview,
        navigate: autoNavigate ? debouncedNavigate : undefined,
      });
    },
    [
      folder,
      onChange,
      document,
      i18nOptions,
      debouncedLocalizedPathname,
      preview,
      autoNavigate,
      debouncedNavigate,
    ]
  );

  const updateFullPath = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      runChange({
        onChange,
        value: e.currentTarget.value,
        document,
        i18nOptions,
        prevLocalizedPathname: debouncedLocalizedPathname,
        preview,
        navigate: autoNavigate ? debouncedNavigate : undefined,
      });
    },
    [
      onChange,
      document,
      i18nOptions,
      debouncedLocalizedPathname,
      preview,
      autoNavigate,
      debouncedNavigate,
    ]
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
          {!autoNavigate && (
            <PreviewButton localizedPathname={localizedPathname || ""} />
          )}
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
        {!autoNavigate && (
          <PreviewButton localizedPathname={localizedPathname || ""} />
        )}
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
    inputValidationProps,
    localizedPathname,
    folderCanUnlock,
    autoNavigate,
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
              <FormFieldValidationStatus
                fontSize={1}
                placement="top"
                validation={validation}
              />
            </Box>
          )}
        </Flex>
        {description && <Text size={1}>{description}</Text>}
      </Stack>

      {typeof value?.current === "string" && (
        <Text muted>
          {prefix}
          {localizedPathname}
        </Text>
      )}

      {pathInput}
    </Stack>
  );
}

function runChange({
  document,
  onChange,
  value,
  i18nOptions,
  prevLocalizedPathname,
  preview,
  navigate,
}: {
  document: DocumentWithLocale;
  onChange: (patch) => void;
  value?: string;
  i18nOptions?: PathnameOptions["i18n"];
  prevLocalizedPathname?: string;
  preview?: string | null;
  navigate?: PresentationNavigateContextValue;
}) {
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

  // Auto-navigate to the updated path in Presentation if enabled
  if (navigate) {
    const newLocalizedPathname = getDocumentPath(
      {
        ...document,
        locale: i18nOptions?.enabled ? document.locale : undefined,
        pathname: finalValue,
      },
      i18nOptions?.defaultLocaleId || "",
      i18nOptions?.localizePathname
    );

    // Auto-navigate if this document is currently being previewed,
    // or if it's a brand new document being created.
    if (preview === prevLocalizedPathname || !document._createdAt) {
      navigate(newLocalizedPathname);
    }
  }
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
