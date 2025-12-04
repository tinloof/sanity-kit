---
"@tinloof/sanity-web": minor
---

Add type-safe generics and sharedProps support to createSectionsRenderer

- `createSectionsRenderer` now accepts two generic type parameters:
  - `TSections`: The sections array type from your Sanity query result
  - `TSharedProps`: Optional type for props shared across all section components

- Renamed `sectionComponentMap` to `components` for a cleaner API

- Added `sharedProps` option to pass props that are spread to all section components

- Section components now receive full type inference based on their `_type`

- Exported new `SectionProps` utility type for typing section components

Example usage:

```tsx
type Sections = NonNullable<PAGE_QUERYResult>["sections"];
type SharedProps = { locale: string };

export const SectionsRenderer = createSectionsRenderer<Sections, SharedProps>({
  components: {
    "section.hero": HeroSection,
    "section.text": TextSection,
  },
});

// In your page
<SectionsRenderer
  sectionsData={page.sections}
  sharedProps={{ locale: "en" }}
/>
