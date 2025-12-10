---
"@tinloof/sanity-web": major
---

BREAKING CHANGES: Removed Next.js-specific utilities that have been moved to @tinloof/sanity-next

The following exports have been completely removed from @tinloof/sanity-web:

**Components:**

- `ExitPreview` component

**Middleware:**

- `redirectIfNeeded` function
- All `/middleware/*` exports removed

**Server utilities:**

- `generateSanitySitemap`
- `generateSanityI18nSitemap`
- All `/server/*` exports removed

**Utils:**

- `getRedirect` function
- `resolveSanityRouteMetadata` function
- `createSanityMetadataResolver` function
- `getOgImages` function

**Queries:**

- `REDIRECT_QUERY`
- `SITEMAP_QUERY`
- `I18N_SITEMAP_QUERY`

**Peer dependencies removed:**

- `next` - no longer required
- `next-sanity` - no longer required

**Migration:** Install `@tinloof/sanity-next` and update your imports to use the new package locations.
