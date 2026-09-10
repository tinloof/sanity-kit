# @tinloof/sanity-next

## 3.0.0

### Major Changes

- Require Sanity 6.12 or later within major 6 (`^6.12.0`) when Sanity is installed, and drop Sanity 5 support. The Sanity peer remains optional. Require next-sanity 13.3.4 or later within major 13 (`^13.3.4`) and drop next-sanity 12 support. Support Sanity client 7.26.2 and 8.6.1. Require Next.js 16.3.4 or later within major 16 and React/React DOM 19.2.4 or later within major 19. Update Portable Text to version 8 and align exported query, sitemap, redirect, and metadata types with current APIs.

  `initSanity` exposes the installed next-sanity version's `SanityLive`. In next-sanity 13, `revalidateSyncTags` becomes `action`; the `refreshOnFocus`, `refreshOnReconnect`, and `refreshOnMount` props and the `defineLive.fetchOptions` option are removed. The examples use a compatibility action for version 12 cache invalidation while a browser is connected. This does not restore focus/reconnect refresh or guarantee fresh content when no browser observes a publication. Consumers requiring that guarantee need server-side cache invalidation. See the [upstream migration guide](https://github.com/sanity-io/next-sanity/blob/main/packages/next-sanity/MIGRATE-v12-to-v13.md).

  Portable Text 8 preserves authored list-level jumps and parent numbering. Review custom list renderers and existing nested content. Stored content is unchanged.
