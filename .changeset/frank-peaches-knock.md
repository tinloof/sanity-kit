---
"@tinloof/sanity-studio": minor
---

Add `page` abstract type to Pages Navigator plugin

The Pages Navigator plugin now provides a reusable `page` abstract that includes common page fields like SEO and pathname configuration. This abstract is automatically injected when using the plugin and requires `@tinloof/sanity-extends` to be configured.

The page abstract includes:

- SEO fields (meta title, description, og:image)
- Pathname field with i18n support
- Content and settings field groups

Documents can extend from it:

```ts
defineType({
  type: "document",
  name: "landingPage",
  extends: "page",
  // ... custom fields
});
```

The abstract can be disabled via plugin configuration:

```ts
pages({
  abstracts: false, // or { page: false }
  // ... other config
});
```
