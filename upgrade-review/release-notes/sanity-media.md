# @tinloof/sanity-media

## 1.0.0

### Major Changes

- Release the first stable public API as 1.0.0. Require Sanity 6.12 or later within major 6 (`^6.12.0`) and drop Sanity 5 support. Update the media plugin for Sanity UI 4, Sanity icons 5, React/React DOM 19.2.4 or later within major 19, and the current AWS S3 SDK. Require Node.js 22.12 or later.

  Update UI imports and schema/input typing, retain S3 signing and authorization behavior, and make decorative video thumbnails muted and inaccessible to keyboard focus. Hide decorative icons from assistive technology. Existing storage configuration and stored asset data are unchanged.


  Delete asset and video-thumbnail documents in one Sanity transaction before deleting storage files. A rejected reference or permission check now leaves files intact. If storage cleanup fails after document deletion, show a warning with the remaining file paths and refresh the library.
