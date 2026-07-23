# @tinloof/sanity-media

A Sanity plugin for managing media assets with S3-compatible storage. Includes a full-featured media library, support for images and videos, tagging, bulk operations, and more.

## Features

- **Media Library Tool** - Browse, search, filter, and manage all your media assets in one place
- **S3-Compatible Storage** - Store assets in Cloudflare R2, AWS S3, or any S3-compatible provider
- **Image and Video Support** - Upload and manage both images and videos with thumbnail generation
- **Tagging System** - Organize assets with custom colored tags
- **Bulk Operations** - Select multiple assets for bulk tagging or deletion
- **Advanced Filtering** - Filter by type, tags, usage status, document type, and metadata
- **Metadata Management** - Edit alt text, captions, titles, and descriptions
- **Reference Tracking** - See which documents use each asset
- **Grid and List Views** - Switch between viewing modes in the media library

## Installation

```bash
npm install @tinloof/sanity-media
```

## Quick Start

### 1. Configure the Plugin

In your `sanity.config.ts`:

```ts
import { defineConfig } from "sanity";
import { mediaPlugin, R2Adapter } from "@tinloof/sanity-media";

export default defineConfig({
  // ... other config
  plugins: [
    mediaPlugin({
      adapter: R2Adapter(),
    }),
  ],
});
```

### 2. Configure Storage Credentials

Open the "Media" tool in your Sanity Studio. You'll be prompted to enter your storage credentials on first use.

For Cloudflare R2, you'll need:

- **Account ID** - Your Cloudflare account ID
- **Access Key ID** - R2 API token access key ID
- **Secret Access Key** - R2 API token secret access key
- **Bucket Name** - Name of your R2 bucket
- **Public URL** - (Optional) Custom domain or R2.dev URL for public access

### 3. Use in Your Schema

Use the provided field types in your schema:

```ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "post",
  type: "document",
  fields: [
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "media.image",
    }),
    defineField({
      name: "video",
      title: "Video",
      type: "media.video",
    }),
    defineField({
      name: "attachment",
      title: "Attachment",
      type: "media.file",
    }),
  ],
});
```

## Schema Types

The plugin provides three field types:

### `media.image`

For image uploads. Supports:
- Alt text (on asset and per-field override)
- Caption (on asset and per-field override)
- Crop and hotspot
- Tags

### `media.video`

For video uploads. Supports:
- Title (on asset and per-field override)
- Description (on asset and per-field override)
- Auto-generated thumbnails
- Tags

### `media.file`

For general file uploads. Supports:
- Title (on asset and per-field override)
- Description (on asset and per-field override)
- Tags

## Media Library

The plugin adds a "Media" tool to your Sanity Studio with:

- **Upload** - Drag and drop or click to upload multiple files at once
- **Search** - Find assets by filename
- **Filter** - Filter by type (images/videos), tags, usage status, and more
- **Tags** - Create, edit, and delete tags with custom colors
- **Bulk Actions** - Select multiple assets for bulk tagging or deletion
- **Detail Panel** - View and edit asset metadata, see references, copy URLs

## Adapters

### Cloudflare R2

```ts
import { mediaPlugin, R2Adapter } from "@tinloof/sanity-media";

mediaPlugin({
  adapter: R2Adapter(),
});
```

### Custom Adapter

Create your own adapter for other S3-compatible services:

```ts
import type { StorageAdapter } from "@tinloof/sanity-media";

const MyCustomAdapter = (): StorageAdapter => ({
  id: "my-storage",
  name: "My Storage",
  description: "Custom storage provider",
  typePrefix: "myStorage",
  fields: [
    {
      key: "endpoint",
      label: "Endpoint URL",
      type: "url",
      required: true,
    },
    {
      key: "accessKeyId",
      label: "Access Key ID",
      type: "text",
      required: true,
    },
    {
      key: "secretAccessKey",
      label: "Secret Access Key",
      type: "password",
      required: true,
    },
    {
      key: "bucketName",
      label: "Bucket Name",
      type: "text",
      required: true,
    },
  ],
  toCredentials: (values) => ({
    endpoint: values.endpoint,
    accessKeyId: values.accessKeyId,
    secretAccessKey: values.secretAccessKey,
    bucketName: values.bucketName,
    region: "auto",
  }),
});
```

## Querying Assets

Query assets using GROQ:

```groq
// Get image URL and metadata
*[_type == "post"] {
  title,
  "imageUrl": coverImage.asset->url,
  "imageAlt": coalesce(coverImage.alt, coverImage.asset->alt),
  "dimensions": coverImage.asset->metadata.dimensions
}

// Get video with thumbnail
*[_type == "post"] {
  title,
  "videoUrl": video.asset->url,
  "thumbnailUrl": video.asset->thumbnail.url,
  "duration": video.asset->metadata.duration
}

// Get assets by tag
*[_type == "r2.imageAsset" && references(*[_type == "r2.tag" && name == "Featured"]._id)]
```

## TypeScript

The plugin exports TypeScript types:

```ts
import type {
  MediaImageValue,
  MediaFileValue,
  StorageAdapter,
  StorageCredentials,
} from "@tinloof/sanity-media";
```

## Storage Utilities

For advanced use cases, you can use the storage client utilities directly:

```ts
import {
  createS3Client,
  uploadFile,
  getPublicUrl,
  validateCredentials,
} from "@tinloof/sanity-media";

// Validate credentials
const isValid = await validateCredentials(credentials);

// Upload a file directly
const result = await uploadFile(credentials, file, "path/to/file.jpg");

// Get public URL
const url = getPublicUrl(credentials, "path/to/file.jpg");
```

## License

MIT
