import { isImageSource, SanityImageSource } from "@sanity/asset-utils";
import { DocumentIcon } from "@sanity/icons";
import imageUrlBuilder from "@sanity/image-url";
import React from "react";
import { isValidElementType } from "react-is";
import { useMemoObservable } from "react-rx";
import {
  getPreviewStateObservable,
  getPreviewValueWithFallback,
  ImageUrlFitMode,
  isString,
  SanityDefaultPreviewProps,
  useClient,
  useDocumentPreviewStore,
  useSchema,
} from "sanity";

import { FolderTreeNode, TreeNode } from "../../../types";

const PreviewElement = ({
  item,
  type,
  fallback,
}: {
  item: Exclude<TreeNode, FolderTreeNode>; // Only accepts a PageTreeNode, FolderTreeNode is forbidden
  type: "media" | "title" | "subtitle";
  fallback?: React.ReactNode | string;
}): React.ReactElement | null => {
  const schema = useSchema();
  const { _id, _type } = item;

  const documentPreviewStore = useDocumentPreviewStore();
  const schemaType = schema.get(_type);

  const { draft, published, isLoading } = useMemoObservable(
    () => getPreviewStateObservable(documentPreviewStore, schemaType!, _id, ""),
    [_id, documentPreviewStore, schemaType]
  )!;

  const previewValues = getPreviewValueWithFallback({
    draft,
    published,
    value: { ...item },
  });

  const showPreview =
    typeof schemaType?.preview?.prepare === "function" && !isLoading;

  if (type === "media") {
    return showPreview ? (
      <PreviewMedia
        {...previewValues}
        isPlaceholder={isLoading ?? true}
        layout="default"
        icon={schemaType.icon}
      />
    ) : (
      <>{!isLoading ? fallback : null}</>
    );
  }

  if (type === "title") {
    return showPreview && previewValues?.title ? (
      <>{previewValues?.title}</>
    ) : (
      <>{fallback}</>
    );
  }

  if (type === "subtitle") {
    return showPreview && previewValues?.subtitle ? (
      <>{previewValues?.subtitle}</>
    ) : (
      <>{fallback}</>
    );
  }

  return null;
};

PreviewElement.displayName = "PreviewElement";

const PreviewMedia = (props: SanityDefaultPreviewProps): React.ReactElement => {
  const { icon, media: mediaProp, imageUrl, title } = props;

  const client = useClient({
    apiVersion: "2024-03-12",
  });
  const imageBuilder = React.useMemo(() => imageUrlBuilder(client), [client]);

  // NOTE: This function exists because the previews provides options
  // for the rendering of the media (dimensions)
  const renderMedia = React.useCallback(
    (options: {
      dimensions: {
        width?: number;
        height?: number;
        fit: ImageUrlFitMode;
        dpr?: number;
      };
    }) => {
      const dimensions = options.dimensions
        ? options.dimensions
        : {
            width: 100,
            height: 100,
            fit: "max" as ImageUrlFitMode,
            dpr: 1,
          };

      // Handle sanity image
      return (
        <img
          alt={isString(title) ? title : undefined}
          referrerPolicy="strict-origin-when-cross-origin"
          src={
            imageBuilder
              .image(
                mediaProp as SanityImageSource /*will only enter this code path if it's compatible*/
              )
              .width(dimensions?.width || 100)
              .height(dimensions.height || 100)
              .fit(dimensions.fit)
              .dpr(dimensions.dpr || 1)
              .url() || ""
          }
        />
      );
    },
    [imageBuilder, mediaProp, title]
  );

  const renderIcon = React.useCallback(() => {
    return React.createElement(icon || DocumentIcon);
  }, [icon]);

  const media = React.useMemo(() => {
    if (icon === false) {
      // Explicitly disabled
      return false;
    }

    if (isValidElementType(mediaProp)) {
      return mediaProp;
    }

    if (React.isValidElement(mediaProp)) {
      return mediaProp;
    }

    if (isImageSource(mediaProp)) {
      return renderMedia;
    }

    // Handle image urls
    if (isString(imageUrl)) {
      return (
        <img
          src={imageUrl}
          alt={isString(title) ? title : undefined}
          referrerPolicy="strict-origin-when-cross-origin"
        />
      );
    }

    // Render fallback icon
    return renderIcon;
  }, [icon, imageUrl, mediaProp, renderIcon, renderMedia, title]);

  if (typeof media === "number" || typeof media === "string") {
    return <>{media}</>;
  }

  const Media = media as React.ComponentType<any>;

  return <Media />;
};

PreviewMedia.displayName = "PreviewMedia";

export { PreviewElement };
