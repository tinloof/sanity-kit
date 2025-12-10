---
"@tinloof/sanity-document-options": patch
"@tinloof/sanity-document-i18n": patch
"@tinloof/sanity-studio": patch
---

Fixed critical publishing issue by migrating package manager from Bun to pnpm. Packages are now published with properly resolved workspace dependencies instead of broken `workspace:*` protocol references, making them installable from npm. Also fixed missing repository metadata and TypeScript errors that were blocking the publish process.
