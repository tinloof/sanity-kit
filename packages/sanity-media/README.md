# @tinloof/sanity-media

A Sanity plugin that enables custom S3-compatible storage for images and files, while using Sanity's native image and file types.

## Features

- 🎨 **Native Sanity Types** - Uses `sanity.imageAsset` and `sanity.fileAsset` for full ecosystem compatibility
- 🗄️ **Custom Storage** - Store assets in your own S3-compatible storage (Cloudflare R2, AWS S3, etc.)
- 🔌 **Asset Source Integration** - Seamlessly integrates with Sanity's asset picker
- 📦 **No Custom Schema** - Works with standard Sanity image and file fields
- 🚀 **Easy Setup** - Configure once, use everywhere

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

### 2. Use in Your Schema

Use Sanity's native `image` type with the custom storage source:

```ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "post",
  type: "document",
  fields: [
    defineField({
      name: "coverImage",
      type: "image",
      options: {
        sources: ["custom-storage"], // Use your custom storage
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative text",
        },
      ],
    }),
  ],
});
```

Or use the helper function:

```ts
import { defineMediaField } from "@tinloof/sanity-media";

export default defineType({
  name: "post",
  type: "document",
  fields: [
    defineMediaField({
      name: "coverImage",
      title: "Cover Image",
    }),
  ],
});
```

### 3. Configure Storage Credentials

Since credentials are stored in localStorage, you need to configure them once. Add this to your studio:

1. Open the browser console
2. Run:

```js
const credentials = {
  accountId: "your-account-id",
  accessKeyId: "your-access-key",
  secretAccessKey: "your-secret-key",
  bucketName: "your-bucket-name",
  publicUrl: "https://your-custom-domain.com", // Optional
};

localStorage.setItem("sanity-media-cloudflare-r2", JSON.stringify(credentials));
```

## Adapters

### Cloudflare R2

```ts
import { mediaPlugin, R2Adapter } from "@tinloof/sanity-media";

mediaPlugin({
  adapter: R2Adapter(),
});
```

Required credentials:

- `accountId` - Your Cloudflare account ID
- `accessKeyId` - R2 API token access key ID
- `secretAccessKey` - R2 API token secret access key
- `bucketName` - Name of your R2 bucket
- `publicUrl` - (Optional) Custom domain or R2.dev URL

### Custom Adapter

Create your own adapter for other S3-compatible services:

```ts
import type { StorageAdapter } from "@tinloof/sanity-media";

const MyCustomAdapter = (): StorageAdapter => ({
  id: "my-storage",
  name: "My Storage",
  description: "Custom storage provider",
  fields: [
    {
      key: "endpoint",
      label: "Endpoint URL",
      type: "url",
      required: true,
    },
    // ... more fields
  ],
  toCredentials: (values) => ({
    endpoint: values.endpoint,
    accessKeyId: values.accessKeyId,
    secretAccessKey: values.secretAccessKey,
    bucketName: values.bucketName,
    region: values.region || "auto",
  }),
});
```

## API Reference

### `defineMediaField(options)`

Helper to create an image field with custom storage.

```ts
defineMediaField({
  name: "image",
  title: "Image",
  description: "Upload an image",
  validation: (Rule) => Rule.required(),
});
```

### `defineMediaFileField(options)`

Helper to create a file field with custom storage.

```ts
defineMediaFileField({
  name: "document",
  title: "Document",
  description: "Upload a file",
});
```

## How It Works

This plugin uses Sanity's [Asset Source API](https://www.sanity.io/docs/asset-sources) to intercept file uploads:

1. When a user uploads a file through the image/file field, they can choose "Custom Storage"
2. The file is uploaded to your S3-compatible storage
3. A `sanity.imageAsset` or `sanity.fileAsset` document is created with your storage URL
4. The asset is linked to your document using standard Sanity references

**Benefits:**

- Full compatibility with Sanity's ecosystem (image queries, GROQ, etc.)
- No vendor lock-in - assets are stored in your infrastructure
- Standard Sanity data structure - no custom types needed
- Works with existing Sanity tools and plugins

## Querying Images

Since this uses native Sanity types, you can query images normally:

```groq
*[_type == "post"] {
  title,
  "imageUrl": coverImage.asset->url,
  "imageAlt": coverImage.alt,
  "imageDimensions": coverImage.asset->metadata.dimensions
}
```

## TypeScript

The plugin exports TypeScript types for your convenience:

```ts
import type { MediaImageValue, MediaFileValue } from "@tinloof/sanity-media";

// Image field value
type ImageField = MediaImageValue;

// File field value
type FileField = MediaFileValue;
```

## Migrating from Custom Types

If you previously used custom `tinloof.image` or `tinloof.video` types, you'll need to:

1. Update your schema to use native `image` or `file` types
2. Migrate existing documents to reference `sanity.imageAsset` instead of `tinloof.image`
3. Remove the old custom types from your schema

## License

MIT © Tinloof
