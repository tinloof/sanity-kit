import type { SanityClient } from "sanity";
import type { StorageAdapter } from "./adapters";
import {
  extractImageMetadata,
  extractVideoMetadata,
} from "./metadata-extractor";
import type { StorageCredentials } from "./storage-client";
import { uploadFile } from "./storage-client";

/**
 * Metadata that can be provided during image upload
 */
export interface ImageUploadMetadata {
  alt?: string;
  caption?: string;
  tags?: string[]; // Array of tag IDs
}

/**
 * Metadata that can be provided during video upload
 */
export interface VideoUploadMetadata {
  title?: string;
  description?: string;
  tags?: string[]; // Array of tag IDs
}

/**
 * Metadata that can be provided during file upload
 */
export interface FileUploadMetadata {
  title?: string;
  description?: string;
  tags?: string[]; // Array of tag IDs
}

/**
 * Handle image upload to custom storage and create asset document
 */
export async function handleImageUpload(
  file: File,
  adapter: StorageAdapter,
  credentials: StorageCredentials,
  client: SanityClient,
  onProgress?: (progress: number) => void,
  userMetadata?: ImageUploadMetadata,
): Promise<{ _ref: string }> {
  const uploadResult = await uploadFile(credentials, file, onProgress);
  const metadata = await extractImageMetadata(file);

  const assetTypeName = `${adapter.typePrefix}.imageAsset`;
  const assetDoc = {
    _type: assetTypeName,
    assetId: uploadResult.key,
    path: uploadResult.key,
    url: uploadResult.publicUrl,
    originalFilename: uploadResult.filename,
    extension: uploadResult.filename.split(".").pop() || "",
    size: uploadResult.size,
    mimeType: uploadResult.contentType,
    metadata:
      metadata.width && metadata.height
        ? {
            dimensions: {
              width: metadata.width,
              height: metadata.height,
              aspectRatio: metadata.width / metadata.height,
            },
            hasAlpha: metadata.hasAlpha || false,
            isOpaque: metadata.isOpaque || true,
            lqip: metadata.lqip,
          }
        : undefined,
    adapter: adapter.id,
    // User-provided metadata
    ...(userMetadata?.alt && { alt: userMetadata.alt }),
    ...(userMetadata?.caption && { caption: userMetadata.caption }),
    ...(userMetadata?.tags?.length && {
      tags: userMetadata.tags.map((tagId) => ({
        _type: "reference",
        _ref: tagId,
        _key: tagId,
      })),
    }),
  };

  const createdAsset = await client.create(assetDoc);

  return { _ref: createdAsset._id };
}

/**
 * Handle file upload to custom storage and create asset document
 */
export async function handleFileUpload(
  file: File,
  adapter: StorageAdapter,
  credentials: StorageCredentials,
  client: SanityClient,
  onProgress?: (progress: number) => void,
): Promise<{ _ref: string }> {
  const uploadResult = await uploadFile(credentials, file, onProgress);

  const assetTypeName = `${adapter.typePrefix}.fileAsset`;
  const assetDoc = {
    _type: assetTypeName,
    assetId: uploadResult.key,
    path: uploadResult.key,
    url: uploadResult.publicUrl,
    originalFilename: uploadResult.filename,
    extension: uploadResult.filename.split(".").pop() || "",
    size: uploadResult.size,
    mimeType: uploadResult.contentType,
    adapter: adapter.id,
  };

  const createdAsset = await client.create(assetDoc);

  return { _ref: createdAsset._id };
}

/**
 * Handle video upload to custom storage, extract thumbnail, and create asset document
 */
export async function handleVideoUpload(
  file: File,
  adapter: StorageAdapter,
  credentials: StorageCredentials,
  client: SanityClient,
  onProgress?: (progress: number) => void,
  userMetadata?: VideoUploadMetadata,
): Promise<{ _ref: string }> {
  const metadata = await extractVideoMetadata(file);
  const uploadResult = await uploadFile(credentials, file, onProgress);

  const thumbnailFile = new File(
    [metadata.thumbnailBlob],
    `${uploadResult.filename}-thumbnail.jpg`,
    { type: "image/jpeg" },
  );

  const thumbnailRef = await handleImageUpload(
    thumbnailFile,
    adapter,
    credentials,
    client,
  );

  const assetTypeName = `${adapter.typePrefix}.videoAsset`;
  const assetDoc = {
    _type: assetTypeName,
    assetId: uploadResult.key,
    path: uploadResult.key,
    url: uploadResult.publicUrl,
    originalFilename: uploadResult.filename,
    extension: uploadResult.filename.split(".").pop() || "",
    size: uploadResult.size,
    mimeType: uploadResult.contentType,
    metadata:
      metadata.width && metadata.height
        ? {
            dimensions: {
              width: metadata.width,
              height: metadata.height,
              aspectRatio: metadata.width / metadata.height,
            },
            duration: metadata.duration,
            hasAudio: metadata.hasAudio,
          }
        : undefined,
    thumbnail: thumbnailRef,
    adapter: adapter.id,
    // User-provided metadata
    ...(userMetadata?.title && { title: userMetadata.title }),
    ...(userMetadata?.description && { description: userMetadata.description }),
    ...(userMetadata?.tags?.length && {
      tags: userMetadata.tags.map((tagId) => ({
        _type: "reference",
        _ref: tagId,
        _key: tagId,
      })),
    }),
  };

  const createdAsset = await client.create(assetDoc);

  return { _ref: createdAsset._id };
}
