---
"@tinloof/sanity-document-options": patch
"@tinloof/sanity-document-i18n": patch
"@tinloof/sanity-studio": patch
---

Fixed publishing issue where packages were published with unresolved `workspace:*` protocol references, making them uninstallable from npm. Workspace dependencies are now properly resolved to actual version numbers during the publish process.
