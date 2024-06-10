import {
  EditIcon,
  EyeOpenIcon,
  FolderIcon,
  LockIcon,
  RefreshIcon,
} from "@sanity/icons";
import {
  usePresentationNavigate,
  usePresentationParams,
} from "@sanity/presentation";
import {
  Box,
  Button,
  Card,
  Flex,
  Spinner,
  Stack,
  Text,
  TextInput,
} from "@sanity/ui";
import * as PathUtils from "@sanity/util/paths";
import { getDocumentPath, stringToPathname } from "@tinloof/sanity-web";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FormFieldValidationStatus,
  FormPatch,
  PatchEvent,
  Path,
  SanityDocument,
  set,
  unset,
  useFormValue,
} from "sanity";
import { styled } from "styled-components";

import { useAsync } from "../hooks/useAsync";
import { SlugContext, usePathnameContext } from "../hooks/usePathnameContext";
import { usePathnamePrefix } from "../hooks/usePathnamePrefix";
import {
  DocumentWithLocale,
  PathnameInputProps,
  PathnameOptions,
  PathnameSourceFn,
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

export function PathnameFieldComponent(props: PathnameInputProps): JSX.Element {
  const fieldOptions = props.schemaType.options as PathnameOptions | undefined;
  const { prefix } = usePathnamePrefix(props);
  const folderOptions = fieldOptions?.folder ?? { canUnlock: true };
  const i18nOptions = fieldOptions?.i18n ?? {
    enabled: false,
    defaultLocaleId: undefined,
    localizePathname: undefined,
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
  const sourceField = fieldOptions?.source;

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
    i18nOptions.defaultLocaleId || "",
    i18nOptions.localizePathname
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
          {sourceField && (
            <GenerateButton
              sourceField={sourceField}
              document={document}
              onChange={onChange}
              folder={folder}
              disabled={readOnly}
            />
          )}
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
        {sourceField && (
          <GenerateButton
            sourceField={sourceField}
            document={document}
            onChange={onChange}
            folder={folder}
            disabled={readOnly}
          />
        )}
        <PreviewButton localizedPathname={localizedPathname || ""} />
      </Flex>
    );
  }, [
    folderLocked,
    folder,
    value,
    updateFullPath,
    handleBlur,
    readOnly,
    inputValidationProps,
    sourceField,
    document,
    onChange,
    localizedPathname,
    folderCanUnlock,
    unlockFolder,
    slug,
    updateFinalSegment,
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

function GenerateButton({
  sourceField,
  document,
  onChange,
  folder,
  disabled,
}: {
  sourceField: string | Path | PathnameSourceFn;
  document: DocumentWithLocale;
  onChange: (patch: FormPatch | PatchEvent | FormPatch[]) => void;
  folder?: string;
  disabled?: boolean;
}) {
  const pathnameContext = usePathnameContext();

  const updatePathname = useCallback(
    (nextPathname: string) => {
      const finalValue = [
        ...(folder ? [folder] : []),
        stringToPathname(nextPathname),
      ]
        .filter((part) => typeof part === "string")
        .join("/");

      runChange(onChange, finalValue);
    },
    [folder, onChange]
  );

  const [generateState, handleGenerateSlug] = useAsync(() => {
    return getNewFromSource(sourceField, document, pathnameContext).then(
      (newFromSource) =>
        updatePathname(
          stringToPathname(newFromSource?.trim() || "", {
            allowTrailingSlash: true,
          })
        )
    );
  }, [sourceField, pathnameContext, updatePathname]);

  const isUpdating = generateState?.status === "pending";

  return (
    <Button
      fontSize={1}
      height="100%"
      mode="ghost"
      tone="default"
      icon={isUpdating ? Spinner : RefreshIcon}
      aria-label="Generate"
      onClick={handleGenerateSlug}
      disabled={disabled || isUpdating}
    />
  );
}

async function getNewFromSource(
  source: string | Path | PathnameSourceFn,
  document: SanityDocument,
  context: SlugContext
): Promise<string | undefined> {
  return typeof source === "function"
    ? source(document, context)
    : (PathUtils.get(document, source) as string | undefined);
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
