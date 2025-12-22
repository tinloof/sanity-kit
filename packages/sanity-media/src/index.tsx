import React from "react";
import { definePlugin } from "sanity";
import type { StorageAdapter } from "./adapters";
import { MediaFileInput } from "./components/media-file-input";
import { MediaImageInput } from "./components/media-image-input";
import { MediaTool } from "./components/media-tool";
import { MediaVideoInput } from "./components/media-video-input";
import { AdapterProvider } from "./context/adapter-context";
import { useCredentials } from "./hooks/use-credentials";
import {
  generateFileAssetType,
  generateImageAssetType,
  generateMediaFileType,
  generateMediaImageType,
  generateMediaVideoType,
  generateVideoAssetType,
} from "./schema-generator";

// Export adapters
export { type AdapterField, R2Adapter, type StorageAdapter } from "./adapters";

// Export storage client utilities (for advanced users)
export type { StorageCredentials } from "./storage-client";
export {
  createS3Client,
  generateKey,
  getPresignedUploadUrl,
  getPublicUrl,
  StorageEndpoints,
  uploadFile,
  validateCredentials,
} from "./storage-client";

// Export types
export type {
  MediaImageValue,
  MediaFileValue,
  MediaStoragePluginConfig,
} from "./types";
export { isImageContentType, isVideoContentType } from "./types";

export interface MediaPluginOptions {
  adapter: StorageAdapter;
}

/**
 * Sanity plugin that enables custom storage for images and files.
 * Creates adapter-specific asset types and provides upload UI.
 */
export const mediaPlugin = definePlugin<MediaPluginOptions>((options) => {
  const { adapter } = options;

  // Generate schema types
  const imageAssetType = generateImageAssetType(adapter);
  const fileAssetType = generateFileAssetType(adapter);
  const videoAssetType = generateVideoAssetType(adapter);
  const mediaImageType = generateMediaImageType(adapter);
  const mediaFileType = generateMediaFileType(adapter);
  const mediaVideoType = generateMediaVideoType(adapter);

  // Wrap input components with adapter context
  function WrappedMediaImageInput(props: any) {
    const { credentials, loading } = useCredentials(adapter);
    return (
      <AdapterProvider
        adapter={adapter}
        credentials={credentials}
        loading={loading}
      >
        <MediaImageInput {...props} />
      </AdapterProvider>
    );
  }

  function WrappedMediaFileInput(props: any) {
    const { credentials, loading } = useCredentials(adapter);
    return (
      <AdapterProvider
        adapter={adapter}
        credentials={credentials}
        loading={loading}
      >
        <MediaFileInput {...props} />
      </AdapterProvider>
    );
  }

  function WrappedMediaVideoInput(props: any) {
    const { credentials, loading } = useCredentials(adapter);
    return (
      <AdapterProvider
        adapter={adapter}
        credentials={credentials}
        loading={loading}
      >
        <MediaVideoInput {...props} />
      </AdapterProvider>
    );
  }

  // Add input components to types
  mediaImageType.components = {
    input: WrappedMediaImageInput,
  };
  mediaFileType.components = {
    input: WrappedMediaFileInput,
  };
  mediaVideoType.components = {
    input: WrappedMediaVideoInput,
  };

  return {
    name: "@tinloof/sanity-media",
    schema: {
      types: [
        imageAssetType,
        fileAssetType,
        videoAssetType,
        mediaImageType,
        mediaFileType,
        mediaVideoType,
      ],
    },
    tools: [
      {
        name: "media",
        title: "Media",
        component: () => <MediaTool adapter={adapter} />,
      },
    ],
  };
});

export default mediaPlugin;
