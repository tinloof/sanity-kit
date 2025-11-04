---
"@tinloof/sanity-web": minor
"sanity-basic-studio": minor
"next-basic-website": minor
---

Add SectionsRenderer component for dynamic section rendering

Introduces a new `SectionsRenderer` component that dynamically renders sections based on their `_type` field. This component is designed for Sanity's modular content approach where pages contain arrays of section objects.

Key features:

- Dynamic section-to-component mapping via `sectionComponentMap`
- Enhanced props for each section component including `_sectionIndex`, `_sections`, and `rootHtmlAttributes`
- Deep link support with automatic ID generation
- Custom fallback component callback for missing section types (breaking change: now accepts a function instead of ReactNode)
- Development warnings for missing components
- Factory function `createSectionsRenderer` for pre-configured instances
