---
"@tinloof/sanity-studio": minor
---

Add `documentActions` option to `defineDocument` and `definePage` utilities for controlling which document actions (publish, delete, duplicate, etc.) are available in the Sanity Studio. Supports fine-grained control through policy objects with mutually exclusive properties: `allow` (whitelist), `deny` (blacklist), `toggles` (per-action enable/disable), and `byRole` (role-based access control). When no actions remain after filtering, a placeholder action is automatically shown to prevent empty action menus. Use `defineActions` resolver in your Sanity config to enable this feature across all document schemas.
