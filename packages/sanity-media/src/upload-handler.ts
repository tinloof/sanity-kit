import type { SanityClient } from "sanity";
import type { StorageAdapter } from "./adapters";
import {
  extractImageMetadata,
  extractVideoMetadata,
  generatePreviewBlob,
} from "./metadata-extractor";
import type { StorageCredentials } from "./storage-client";
import { getPreviewKey, uploadBlob, uploadFile } from "./storage-client";

/**
 * Load an image from URL for processing.
 * Attempts CORS-enabled loading first, falls back to same-origin if CORS fails.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    const cleanup = () => {
      img.onload = null;
      img.onerror = null;
    };

    img.onload = () => {
      cleanup();
      resolve(img);
    };

    img.onerror = (error) => {
      cleanup();
      // If CORS failed, try without crossOrigin (won't work for canvas but avoids complete failure)
      if (img.crossOrigin === "anonymous") {
        const fallbackImg = new Image();
        fallbackImg.onload = () => resolve(fallbackImg);
        fallbackImg.onerror = () => reject(new Error("Failed to load image"));
        fallbackImg.src = src;
      } else {
        reject(error);
      }
    };

    img.crossOrigin = "anonymous";
    img.src = src;
  });
}

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

  // Try to generate and upload preview (non-blocking)
  let previewUrl: string | undefined;
  try {
    const img = await loadImage(uploadResult.publicUrl);
    const previewBlob = await generatePreviewBlob(img);

    if (previewBlob) {
      const previewKey = getPreviewKey(uploadResult.key);
      const previewResult = await uploadBlob(
        credentials,
        previewBlob,
        previewKey,
        "image/webp"
      );
      previewUrl = previewResult.publicUrl;
    }
  } catch (error) {
    // Non-critical: preview generation failed but main upload succeeded
    console.warn("Failed to generate preview (continuing without):", error);
  }

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
    // Preview thumbnail URL
    ...(previewUrl && { preview: previewUrl }),
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
