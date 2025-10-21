---
"@tinloof/sanity-web": minor
---

Add `createSanityMetadataResolver` utility for generating Next.js metadata from Sanity CMS content

This new utility provides a comprehensive solution for generating Next.js metadata including SEO tags, Open Graph images, canonical URLs, and internationalization support. The factory function creates a reusable metadata resolver that can be configured once and used across multiple pages.

Key features:

- **Factory pattern**: Configure once with client, websiteBaseURL, and defaultLocaleId
- **SEO optimization**: Generates title, description, and Open Graph metadata
- **Image handling**: Automatic Open Graph image generation from Sanity image assets
- **Internationalization**: Support for multi-language sites with canonical URLs and alternate language links
- **Indexing control**: Respects indexable field for search engine visibility

The resolver handles pathname localization, canonical URL generation, and provides fallback logic for Open Graph images from parent metadata when SEO images aren't available.
