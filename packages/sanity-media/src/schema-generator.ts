import { DocumentIcon, ImageIcon, PlayIcon, TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import type { StorageAdapter } from "./adapters";
import { formatDuration, formatFileSize } from "./utils";

/**
 * Generate tag document type for an adapter
 * Used to organize and filter media assets
 */
export function generateTagType(adapter: StorageAdapter) {
  const typeName = `${adapter.typePrefix}.tag`;

  return defineType({
    name: typeName,
    title: `${adapter.name} Tag`,
    type: "document",
    icon: TagIcon,
    __experimental_omnisearch_visibility: false,
    fields: [
      defineField({
        name: "name",
        title: "Name",
        type: "string",
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "color",
        title: "Color",
        type: "string",
        options: {
          list: [
            { title: "Gray", value: "gray" },
            { title: "Blue", value: "blue" },
            { title: "Purple", value: "purple" },
            { title: "Magenta", value: "magenta" },
            { title: "Red", value: "red" },
            { title: "Orange", value: "orange" },
            { title: "Yellow", value: "yellow" },
            { title: "Green", value: "green" },
            { title: "Cyan", value: "cyan" },
          ],
        },
        initialValue: "gray",
      }),
    ],

    preview: {
      select: {
        title: "name",
        color: "color",
      },
      prepare({ title, color }) {
        return {
          title: title || "Untitled Tag",
          subtitle: color,
        };
      },
    },
  });
}

/**
 * Generate imageAsset document type for an adapter
 * Mirrors sanity.imageAsset schema exactly
 */
export function generateImageAssetType(adapter: StorageAdapter) {
  const typeName = `${adapter.typePrefix}.imageAsset`;

  return defineType({
    name: typeName,
    title: `${adapter.name} Image Asset`,
    type: "document",
    icon: ImageIcon,
    __experimental_omnisearch_visibility: false,
    fields: [
      // Core fields (match sanity.imageAsset)
      defineField({
        name: "assetId",
        title: "Asset ID",
        type: "string",
        description: "Unique identifier (storage key)",
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "path",
        title: "Path",
        type: "string",
        description: "Storage path/key",
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "url",
        title: "URL",
        type: "url",
        description: "Public URL to the asset",
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "originalFilename",
        title: "Original Filename",
        type: "string",
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "extension",
        title: "Extension",
        type: "string",
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "size",
        title: "Size (bytes)",
        type: "number",
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "mimeType",
        title: "MIME Type",
        type: "string",
        validation: (Rule) => Rule.required(),
      }),

      // Metadata object (for images)
      defineField({
        name: "metadata",
        title: "Metadata",
        type: "object",
        fields: [
          {
            name: "dimensions",
            type: "object",
            fields: [
              { name: "width", type: "number", title: "Width" },
              { name: "height", type: "number", title: "Height" },
              { name: "aspectRatio", type: "number", title: "Aspect Ratio" },
            ],
          },
          { name: "hasAlpha", type: "boolean", title: "Has Alpha Channel" },
          { name: "isOpaque", type: "boolean", title: "Is Opaque" },
          {
            name: "lqip",
            type: "string",
            title: "Low Quality Image Placeholder",
          },
          {
            name: "palette",
            type: "object",
            title: "Color Palette",
            fields: [
              {
                name: "dominant",
                type: "object",
                fields: [
                  { name: "background", type: "string" },
                  { name: "foreground", type: "string" },
                ],
              },
            ],
          },
        ],
      }),

      // Adapter info (identifies which storage)
      defineField({
        name: "adapter",
        title: "Storage Adapter",
        type: "string",
        initialValue: adapter.id,
        readOnly: true,
        hidden: true,
      }),

      // Tags for organization
      defineField({
        name: "tags",
        title: "Tags",
        type: "array",
        of: [{ type: "reference", weak: true, to: [{ type: `${adapter.typePrefix}.tag` }] }],
      }),

      // Default user-facing metadata (can be overridden in media.image)
      defineField({
        name: "alt",
        title: "Alt Text",
        type: "string",
        description: "Default alt text for accessibility",
      }),
      defineField({
        name: "caption",
        title: "Caption",
        type: "text",
        description: "Default caption for this image",
      }),
      defineField({
        name: "preview",
        title: "Preview URL",
        type: "url",
        description: "Optimized thumbnail for browsing (auto-generated)",
        readOnly: true,
        hidden: true,
      }),
    ],

    preview: {
      select: {
        url: "url",
        filename: "originalFilename",
        width: "metadata.dimensions.width",
        height: "metadata.dimensions.height",
      },
      prepare({ url, filename, width, height }) {
        return {
          title: filename || "Image",
          subtitle: width && height ? `${width} × ${height}` : undefined,
          imageUrl: url,
        };
      },
    },
  });
}

/**
 * Generate fileAsset document type for an adapter
 * Mirrors sanity.fileAsset schema exactly (without image metadata)
 */
export function generateFileAssetType(adapter: StorageAdapter) {
  const typeName = `${adapter.typePrefix}.fileAsset`;

  return defineType({
    name: typeName,
    title: `${adapter.name} File Asset`,
    type: "document",
    icon: DocumentIcon,
    __experimental_omnisearch_visibility: false,
    fields: [
      // Same core fields as imageAsset, minus metadata
      defineField({
        name: "assetId",
        title: "Asset ID",
        type: "string",
        description: "Unique identifier (storage key)",
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "path",
        title: "Path",
        type: "string",
        description: "Storage path/key",
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "url",
        title: "URL",
        type: "url",
        description: "Public URL to the asset",
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "originalFilename",
        title: "Original Filename",
        type: "string",
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "extension",
        title: "Extension",
        type: "string",
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "size",
        title: "Size (bytes)",
        type: "number",
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "mimeType",
        title: "MIME Type",
        type: "string",
        validation: (Rule) => Rule.required(),
      }),

      // Adapter info
      defineField({
        name: "adapter",
        title: "Storage Adapter",
        type: "string",
        initialValue: adapter.id,
        readOnly: true,
        hidden: true,
      }),

      // Tags for organization
      defineField({
        name: "tags",
        title: "Tags",
        type: "array",
        of: [{ type: "reference", weak: true, to: [{ type: `${adapter.typePrefix}.tag` }] }],
      }),

      // Default user-facing metadata (can be overridden in media.file)
      defineField({
        name: "title",
        title: "Title",
        type: "string",
        description: "Default title for this file",
      }),
      defineField({
        name: "description",
        title: "Description",
        type: "text",
        description: "Default description for this file",
      }),
    ],

    preview: {
      select: {
        filename: "originalFilename",
        size: "size",
        mimeType: "mimeType",
      },
      prepare({ filename, size, mimeType }) {
        return {
          title: filename || "File",
          subtitle: `${formatFileSize(size)} · ${mimeType}`,
        };
      },
    },
  });
}

/**
 * Generate media.image object type
 * This is what users actually use in their schemas
 */
export function generateMediaImageType(adapter: StorageAdapter) {
  const assetTypeName = `${adapter.typePrefix}.imageAsset`;

  return defineType({
    name: "media.image",
    title: "Image",
    type: "object",
    fields: [
      defineField({
        name: "asset",
        title: "Asset",
        type: "reference",
        to: [{ type: assetTypeName }],
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "alt",
        title: "Alt Text",
        type: "string",
        description: "Important for SEO and accessibility",
      }),
      defineField({
        name: "caption",
        title: "Caption",
        type: "text",
      }),
    ],
  });
}

/**
 * Generate videoAsset document type for an adapter
 * Similar to imageAsset but with video-specific metadata and thumbnail reference
 */
export function generateVideoAssetType(adapter: StorageAdapter) {
  const typeName = `${adapter.typePrefix}.videoAsset`;
  const thumbnailTypeName = `${adapter.typePrefix}.imageAsset`;

  return defineType({
    name: typeName,
    title: `${adapter.name} Video Asset`,
    type: "document",
    icon: PlayIcon,
    __experimental_omnisearch_visibility: false,
    fields: [
      // Core fields (same as imageAsset)
      defineField({
        name: "assetId",
        title: "Asset ID",
        type: "string",
        description: "Unique identifier (storage key)",
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "path",
        title: "Path",
        type: "string",
        description: "Storage path/key",
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "url",
        title: "URL",
        type: "url",
        description: "Public URL to the asset",
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "originalFilename",
        title: "Original Filename",
        type: "string",
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "extension",
        title: "Extension",
        type: "string",
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "size",
        title: "Size (bytes)",
        type: "number",
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "mimeType",
        title: "MIME Type",
        type: "string",
        validation: (Rule) => Rule.required(),
      }),

      // Video-specific metadata
      defineField({
        name: "metadata",
        title: "Metadata",
        type: "object",
        fields: [
          {
            name: "dimensions",
            type: "object",
            fields: [
              { name: "width", type: "number", title: "Width" },
              { name: "height", type: "number", title: "Height" },
              { name: "aspectRatio", type: "number", title: "Aspect Ratio" },
            ],
          },
          {
            name: "duration",
            type: "number",
            title: "Duration (seconds)",
          },
          {
            name: "hasAudio",
            type: "boolean",
            title: "Has Audio",
            description: "Indicates whether the video contains audio tracks",
          },
        ],
      }),

      // Thumbnail reference to r2.imageAsset
      defineField({
        name: "thumbnail",
        title: "Thumbnail",
        type: "reference",
        to: [{ type: thumbnailTypeName }],
        description: "Auto-generated thumbnail from video frame",
      }),

      // Adapter info
      defineField({
        name: "adapter",
        title: "Storage Adapter",
        type: "string",
        initialValue: adapter.id,
        readOnly: true,
        hidden: true,
      }),

      // Tags for organization
      defineField({
        name: "tags",
        title: "Tags",
        type: "array",
        of: [{ type: "reference", weak: true, to: [{ type: `${adapter.typePrefix}.tag` }] }],
      }),

      // Default user-facing metadata (can be overridden in media.video)
      defineField({
        name: "title",
        title: "Title",
        type: "string",
        description: "Default title for this video",
      }),
      defineField({
        name: "description",
        title: "Description",
        type: "text",
        description: "Default description for this video",
      }),
      defineField({
        name: "preview",
        title: "Preview URL",
        type: "url",
        description: "Optimized thumbnail for browsing (auto-generated)",
        readOnly: true,
        hidden: true,
      }),
    ],

    preview: {
      select: {
        url: "thumbnail.url",
        filename: "originalFilename",
        width: "metadata.dimensions.width",
        height: "metadata.dimensions.height",
        duration: "metadata.duration",
      },
      prepare({ url, filename, width, height, duration }) {
        const durationStr = duration ? formatDuration(duration) : undefined;
        return {
          title: filename || "Video",
          subtitle:
            width && height
              ? `${width} × ${height}${durationStr ? ` · ${durationStr}` : ""}`
              : durationStr,
          imageUrl: url,
        };
      },
    },
  });
}

/**
 * Generate media.file object type
 */
export function generateMediaFileType(adapter: StorageAdapter) {
  const assetTypeName = `${adapter.typePrefix}.fileAsset`;

  return defineType({
    name: "media.file",
    title: "File",
    type: "object",
    fields: [
      defineField({
        name: "asset",
        title: "Asset",
        type: "reference",
        to: [{ type: assetTypeName }],
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "title",
        title: "Title",
        type: "string",
      }),
      defineField({
        name: "description",
        title: "Description",
        type: "text",
      }),
    ],
  });
}

/**
 * Generate media.video object type
 */
export function generateMediaVideoType(adapter: StorageAdapter) {
  const assetTypeName = `${adapter.typePrefix}.videoAsset`;

  return defineType({
    name: "media.video",
    title: "Video",
    type: "object",
    fields: [
      defineField({
        name: "asset",
        title: "Asset",
        type: "reference",
        to: [{ type: assetTypeName }],
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "title",
        title: "Title",
        type: "string",
      }),
      defineField({
        name: "description",
        title: "Description",
        type: "text",
      }),
    ],
  });
}

