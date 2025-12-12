---
"@tinloof/sanity-next": minor
---

Add standalone SanityImage component export with improved configuration defaults

The `SanityImage` component is now available as a standalone export at `@tinloof/sanity-next/components/sanity-image`. Key improvements:

- **New export path**: Import directly via `@tinloof/sanity-next/components/sanity-image`
- **Optional config prop**: The `config` prop is now optional and defaults to environment variables (`NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`)
- **Improved DX**: No need to pass config explicitly when using standard environment variables
