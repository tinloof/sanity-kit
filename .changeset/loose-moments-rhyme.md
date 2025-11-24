---
"@tinloof/sanity-studio": patch
---

Remove default "settings" group assignment from schema fields

Removes the hardcoded `group: "settings"` property from SEO object, pathname slug, and internal title fields to allow more flexible grouping in document schemas. This gives developers full control over field organization without being constrained by default group assignments.

**Affected fields:**

- `seo` object field
- `pathname` slug field
- `internalTitle` string field

This is a non-breaking change that only removes default grouping behavior while preserving all field functionality.
