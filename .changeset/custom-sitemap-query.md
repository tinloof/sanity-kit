---
"@tinloof/sanity-next": minor
---

Add optional `sitemapQuery` configuration to `initSanity`, `initSanityUtils`, and `initSanityI18nUtils`, and a `query` option to the underlying sitemap helpers. Consumers can customize document filtering and date projections while keeping the zero-argument `generateSitemap()` route integration. Default queries, URL generation, and published-only fetching are unchanged. Custom i18n queries must return the requested locale and a translations array.
