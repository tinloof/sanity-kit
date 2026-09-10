# @tinloof/sanity-media

## 1.0.0

### Major Changes

- 94e9e1a: Release the first stable public API as 1.0.0. Require Sanity 6.12 or later within major 6 (`^6.12.0`) and drop Sanity 5 support. Update the media plugin for Sanity UI 4, Sanity icons 5, React/React DOM 19.2.4 or later within major 19, and the current AWS S3 SDK. Require Node.js 22.12 or later.
  
  Update UI imports and schema/input typing, retain S3 signing and authorization behavior, and make decorative video thumbnails muted and inaccessible to keyboard focus. Hide decorative icons from assistive technology. Existing storage configuration and stored asset data are unchanged.
  
  Delete asset and video-thumbnail documents in one Sanity transaction before deleting storage files. A rejected reference or permission check now leaves files intact. If storage cleanup fails after document deletion, show a warning with the remaining file paths and refresh the library.

## 0.1.0

### Minor Changes

- e96f174: First stable release of the Sanity media plugin: media library tool with S3-compatible storage adapters (AWS S3, Cloudflare R2), image/video/file inputs, drag & drop uploads, tagging, metadata editing, video thumbnails, and video caption support.

## 0.0.0-20260210151319

### Patch Changes

- Inline metadata, add metadata before uploading in the input fields

## 0.0.0-20260206162329

### Patch Changes

- Rename name and title, open settings button when creds are not configured

## 0.0.0-20260202002852

### Patch Changes

- isDev check for settings button

## 0.0.1

### Initial Release

- Media library tool for Sanity Studio
- S3-compatible storage support (AWS S3, Cloudflare R2, etc.)
- Automatic metadata extraction for images and videos
- Video thumbnail generation
- Drag & drop uploads with progress tracking
- Secure credential storage via `@sanity/studio-secrets`
