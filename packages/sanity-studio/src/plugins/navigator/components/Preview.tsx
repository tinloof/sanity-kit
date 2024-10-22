import { isImageSource, SanityImageSource } from "@sanity/asset-utils";
import { DocumentIcon } from "@sanity/icons";
import imageUrlBuilder from "@sanity/image-url";
import React, { useMemo } from "react";
import { isValidElementType } from "react-is";
import { useMemoObservable } from "react-rx";
import {
  getPreviewStateObservable,
  getPreviewValueWithFallback,
  ImageUrlFitMode,
  isString,
  SanityDefaultPreviewProps,
  SanityDocument,
  SchemaType,
  useClient,
  useDocumentPreviewStore,
  useSchema,
} from "sanity";

import { FolderTreeNode, TreeNode } from "../../../types";

const PreviewElement = (props: {
  item: Exclude<TreeNode, FolderTreeNode>; // Only accepts a PageTreeNode, FolderTreeNode is forbidden
  type: "media" | "title" | "subtitle";
  fallback?: React.ReactNode | string;
}): React.ReactElement | null => {
  const schema = useSchema();
  const { _type } = props.item;
  const schemaType = schema.get(_type);

  if (!schemaType) {
    return null;
  }

  return <Preview schemaType={schemaType} {...props} />;
};

PreviewElement.displayName = "PreviewElement";

const Preview = ({
  schemaType,
  item,
  type,
  fallback,
}: {
  schemaType: SchemaType;
  item: Exclude<TreeNode, FolderTreeNode>;
  type: "media" | "title" | "subtitle";
  fallback?: React.ReactNode | string;
}) => {
  const documentPreviewStore = useDocumentPreviewStore();
  const previewState = useMemoObservable(
    () =>
      getPreviewStateObservable(documentPreviewStore, schemaType, item._id, ""),
    [item._id, documentPreviewStore, schemaType]
  );

  const draft = previewState?.draft;
  const published = previewState?.published;
  const isLoading = previewState?.isLoading;

  const sanityDocument = useMemo(() => {
    return {
      _id: item._id,
      _type: schemaType.name,
    } as SanityDocument;
  }, [item._id, schemaType.name]);

  const previewValues = getPreviewValueWithFallback({
    draft,
    published,
    value: sanityDocument,
  });

  const showPreview =
    schemaType?.icon ||
    (typeof schemaType?.preview?.prepare === "function" && !isLoading);

  if (type === "media") {
    return showPreview ? (
      <PreviewMedia
        {...previewValues}
        isPlaceholder={isLoading ?? true}
        layout="default"
        icon={schemaType?.icon}
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

Preview.displayName = "Preview";

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
          style={{ maxWidth: "100%" }}
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

  if (typeof media === "object" && React.isValidElement(media)) {
    return media;
  }

  const Media = media as React.ComponentType<any>;

  return <Media />;
};

PreviewMedia.displayName = "PreviewMedia";

export { PreviewElement };
