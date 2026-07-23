# @tinloof/sanity-media - Architecture Documentation

## Overview

The `@tinloof/sanity-media` plugin provides a complete media management solution for Sanity Studio, enabling storage of images, videos, and files in S3-compatible object storage (Cloudflare R2, AWS S3, MinIO, etc.) instead of Sanity's built-in CDN.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SANITY STUDIO                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         mediaPlugin (index.tsx)                          │    │
│  │  - Registers schema types                                                │    │
│  │  - Provides Media tool                                                   │    │
│  │  - Wraps inputs with AdapterProvider                                     │    │
│  └──────────────────────────────┬──────────────────────────────────────────┘    │
│                                 │                                                │
│         ┌───────────────────────┼───────────────────────┐                       │
│         │                       │                       │                       │
│         ▼                       ▼                       ▼                       │
│  ┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐               │
│  │ Media Tool  │     │  Schema Types   │     │  Input Fields   │               │
│  │ (Tab View)  │     │  (Generated)    │     │  (Custom)       │               │
│  └──────┬──────┘     └────────┬────────┘     └────────┬────────┘               │
│         │                     │                       │                         │
│         ▼                     │                       ▼                         │
│  ┌────────────────────┐       │            ┌────────────────────┐              │
│  │    MediaPanel      │       │            │  MediaImageInput   │              │
│  │  - Browse assets   │       │            │  MediaVideoInput   │              │
│  │  - Upload files    │       │            │  MediaFileInput    │              │
│  │  - Manage tags     │       │            └─────────┬──────────┘              │
│  │  - Settings        │       │                      │                         │
│  └──────────┬─────────┘       │                      │                         │
│             │                 │                      │                         │
│             └────────────┬────┴──────────────────────┘                         │
│                          │                                                      │
│                          ▼                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                        CORE SERVICES                                      │  │
│  │                                                                           │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐   │  │
│  │  │ StorageAdapter  │  │ upload-handler  │  │  metadata-extractor     │   │  │
│  │  │ (adapters.ts)   │  │ (upload-handler │  │  (metadata-extractor    │   │  │
│  │  │                 │  │      .ts)       │  │        .ts)             │   │  │
│  │  │ - R2Adapter()   │  │                 │  │                         │   │  │
│  │  │ - Custom        │  │ - handleImage   │  │  - extractImageMetadata │   │  │
│  │  │   adapters      │  │   Upload()      │  │  - extractVideoMetadata │   │  │
│  │  │                 │  │ - handleVideo   │  │  - generateLQIP         │   │  │
│  │  │ Defines:        │  │   Upload()      │  │  - detectAlphaChannel   │   │  │
│  │  │ - typePrefix    │  │ - handleFile    │  │                         │   │  │
│  │  │ - credentials   │  │   Upload()      │  │                         │   │  │
│  │  │   schema        │  │                 │  │                         │   │  │
│  │  └────────┬────────┘  └────────┬────────┘  └────────────┬────────────┘   │  │
│  │           │                    │                        │                 │  │
│  │           └──────────────┬─────┴────────────────────────┘                 │  │
│  │                          │                                                │  │
│  │                          ▼                                                │  │
│  │           ┌──────────────────────────────┐                                │  │
│  │           │      storage-client.ts       │                                │  │
│  │           │                              │                                │  │
│  │           │  - createS3Client()          │                                │  │
│  │           │  - getPresignedUploadUrl()   │                                │  │
│  │           │  - uploadFile()              │                                │  │
│  │           │  - deleteFile()              │                                │  │
│  │           │  - validateCredentials()     │                                │  │
│  │           └──────────────┬───────────────┘                                │  │
│  │                          │                                                │  │
│  └──────────────────────────┼────────────────────────────────────────────────┘  │
│                             │                                                    │
└─────────────────────────────┼────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │      EXTERNAL SERVICES        │
              │                               │
              │  ┌─────────────────────────┐  │
              │  │   S3-Compatible Storage │  │
              │  │   (R2, S3, MinIO, etc)  │  │
              │  │                         │  │
              │  │   - Presigned URLs      │  │
              │  │   - Direct upload       │  │
              │  │   - Public access       │  │
              │  └─────────────────────────┘  │
              │                               │
              │  ┌─────────────────────────┐  │
              │  │    Sanity Content Lake  │  │
              │  │                         │  │
              │  │   - Asset documents     │  │
              │  │   - Tag documents       │  │
              │  │   - References          │  │
              │  └─────────────────────────┘  │
              │                               │
              └───────────────────────────────┘
```

## Core Components

### 1. Plugin Entry Point (`index.tsx`)

The main plugin definition that:
- Accepts configuration options (`adapter`, `toolName`, `toolTitle`)
- Generates all schema types dynamically based on the adapter
- Registers the Media tool in Studio
- Wraps field inputs with the `AdapterProvider` context

```typescript
mediaPlugin({
  adapter: R2Adapter(),
  toolName: "media",      // optional, avoids conflicts with other plugins
  toolTitle: "Media",     // optional, display name
})
```

### 2. Storage Adapter System (`adapters.ts`)

Adapters define how to connect to different storage providers. Each adapter provides:

| Property | Description |
|----------|-------------|
| `id` | Unique identifier (e.g., "cloudflare-r2") |
| `name` | Display name for UI |
| `typePrefix` | Prefix for schema types (e.g., "r2" → `r2.imageAsset`) |
| `fields` | Credential field definitions for the settings UI |
| `toCredentials()` | Transforms user input into `StorageCredentials` |

**Built-in Adapter:** `R2Adapter()` for Cloudflare R2

**Creating Custom Adapters:**
```typescript
function S3Adapter(): StorageAdapter {
  return {
    id: "aws-s3",
    name: "AWS S3",
    typePrefix: "s3",  // Creates s3.imageAsset, s3.tag, etc.
    fields: [...],
    toCredentials: (values) => ({...}),
  };
}
```

### 3. Schema Types (`schema-generator.ts`)

Dynamically generates Sanity schema types based on the adapter's `typePrefix`:

| Generated Type | Example with R2 | Description |
|---------------|-----------------|-------------|
| `{prefix}.tag` | `r2.tag` | Tag documents for organizing assets |
| `{prefix}.imageAsset` | `r2.imageAsset` | Image asset documents |
| `{prefix}.videoAsset` | `r2.videoAsset` | Video asset documents |
| `{prefix}.fileAsset` | `r2.fileAsset` | Generic file asset documents |
| `media.image` | `media.image` | Object type for image fields |
| `media.video` | `media.video` | Object type for video fields |
| `media.file` | `media.file` | Object type for file fields |

**Asset Document Structure:**
```typescript
{
  _type: "r2.imageAsset",
  assetId: "uploads/123-uuid-filename.jpg",  // Storage key
  path: "uploads/123-uuid-filename.jpg",
  url: "https://media.example.com/uploads/123-uuid-filename.jpg",
  originalFilename: "photo.jpg",
  extension: "jpg",
  size: 1024000,
  mimeType: "image/jpeg",
  metadata: {
    dimensions: { width: 1920, height: 1080, aspectRatio: 1.78 },
    hasAlpha: false,
    isOpaque: true,
    lqip: "data:image/jpeg;base64,..."  // Low-quality placeholder
  },
  adapter: "cloudflare-r2",
  tags: [{ _ref: "tag-id", _type: "reference" }],
  alt: "Description",
  caption: "Caption text"
}
```

### 4. Storage Client (`storage-client.ts`)

Low-level S3-compatible storage operations using the AWS SDK:

| Function | Purpose |
|----------|---------|
| `createS3Client()` | Creates configured S3 client |
| `getPresignedUploadUrl()` | Generates signed URL for direct browser upload |
| `uploadFile()` | Handles upload with progress tracking |
| `deleteFile()` | Removes file from storage |
| `validateCredentials()` | Tests if credentials work |
| `getPublicUrl()` | Constructs public URL for an asset |

**Upload Flow:**
1. Generate presigned URL from S3 API
2. Browser uploads directly to storage (not through Sanity)
3. Progress tracked via XHR events

### 5. Upload Handler (`upload-handler.ts`)

Orchestrates the complete upload process:

```
File → Extract Metadata → Upload to Storage → Create Sanity Document
```

**For Videos:**
```
Video File → Extract Metadata + Thumbnail → Upload Video → Upload Thumbnail
          → Create Thumbnail Document → Create Video Document (with thumbnail ref)
```

### 6. Metadata Extractor (`metadata-extractor.ts`)

Client-side metadata extraction:

| Asset Type | Extracted Data |
|------------|---------------|
| **Images** | Dimensions, aspect ratio, alpha channel detection, LQIP generation |
| **Videos** | Dimensions, duration, audio track detection, thumbnail frame capture |

### 7. UI Components

#### Media Tool (`components/media-tool.tsx`)
Main tool with tab navigation:
- **Media Tab**: Browse, search, filter, upload assets
- **Settings Tab**: Configure storage credentials

#### Media Panel (`components/media-panel/`)
Asset management interface:
- Grid/List view modes
- Search and filtering (by type, tags, advanced filters)
- Bulk selection and deletion
- Tag management sidebar
- Asset detail panel with metadata editing

#### Field Inputs (`components/media-*-input.tsx`)
Custom input components for schema fields:
- `MediaImageInput` - Image picker with upload
- `MediaVideoInput` - Video picker with upload
- `MediaFileInput` - File picker with upload

All inputs open a `MediaBrowserDialog` for asset selection.

### 8. Context Providers

#### AdapterProvider (`context/adapter-context.tsx`)
Provides adapter and credentials throughout the component tree.

#### MediaSelectionProvider (`context/selection-context.tsx`)
Manages bulk selection state across the Media tool.

### 9. Custom Hooks

| Hook | Purpose |
|------|---------|
| `useCredentials` | Loads/saves credentials from Sanity secrets |
| `useTags` | CRUD operations for tags |
| `useTagEditor` | Tag editing UI state |
| `useMediaQuery` | Fetches and filters assets |
| `useUploadQueue` | Manages concurrent uploads |
| `useBulkSelection` | Multi-select state management |
| `useAdvancedFilters` | Complex filter state |

## Data Flow

### Upload Flow

```
1. User drops file in MediaPanel or Input
                │
                ▼
2. File validated (type, size)
                │
                ▼
3. Metadata extracted (dimensions, LQIP, etc.)
                │
                ▼
4. Presigned URL requested from S3
                │
                ▼
5. Direct upload to S3 (with progress)
                │
                ▼
6. Asset document created in Sanity
                │
                ▼
7. UI updated via SWR mutation
```

### Asset Selection Flow

```
1. User clicks on media.image field
                │
                ▼
2. MediaBrowserDialog opens
                │
                ▼
3. Assets loaded via useMediaQuery (GROQ)
                │
                ▼
4. User filters/searches/browses
                │
                ▼
5. User selects asset
                │
                ▼
6. Reference set: { _type: "reference", _ref: "asset-id" }
```

## Configuration

### Plugin Options

```typescript
interface MediaPluginOptions {
  adapter: StorageAdapter;   // Required: Storage adapter instance
  toolName?: string;         // Optional: Tool URL name (default: "media")
  toolTitle?: string;        // Optional: Tool display name (default: "Media")
}
```

### Credential Storage

Credentials are stored securely in Sanity's secrets system:
- Key: `tinloof-media-{adapterId}` (e.g., `tinloof-media-cloudflare-r2`)
- Value: JSON-encoded credential fields

## Key Design Decisions

### 1. Adapter Pattern
Allows supporting multiple storage providers without code changes. New providers only need a new adapter factory function.

### 2. Prefixed Schema Types
Using `typePrefix` (e.g., `r2.imageAsset` instead of `media.imageAsset`) prevents conflicts when:
- Multiple adapters are used
- Other media plugins are installed (e.g., `sanity-plugin-media` uses `media.tag`)

### 3. Direct Browser Upload
Files upload directly from browser to S3 via presigned URLs:
- No server-side processing needed
- Better performance for large files
- Progress tracking possible

### 4. Client-Side Metadata Extraction
Metadata is extracted in the browser before upload:
- Reduces server dependencies
- Works with any S3-compatible storage
- LQIP generated without external services

### 5. Reference-Based Asset System
Assets are stored as separate documents, referenced from content:
- Reusable across documents
- Bulk management in Media tool
- Consistent with Sanity's native asset system

## File Structure

```
src/
├── index.tsx              # Plugin entry point
├── adapters.ts            # Storage adapter definitions
├── schema-generator.ts    # Dynamic schema type generation
├── storage-client.ts      # S3 client operations
├── upload-handler.ts      # Upload orchestration
├── metadata-extractor.ts  # Client-side metadata extraction
├── types.ts               # TypeScript interfaces
├── constants.ts           # API version, etc.
├── utils.ts               # Helper functions
├── context/
│   ├── adapter-context.tsx
│   └── selection-context.tsx
├── hooks/
│   └── use-credentials.ts
└── components/
    ├── media-tool.tsx
    ├── settings-panel.tsx
    ├── media-image-input.tsx
    ├── media-video-input.tsx
    ├── media-file-input.tsx
    ├── media-panel/
    │   ├── index.tsx
    │   ├── types.ts
    │   └── components/
    └── shared/
        ├── hooks/
        │   ├── use-tags.ts
        │   ├── use-media-query.ts
        │   └── ...
        └── ...
```
