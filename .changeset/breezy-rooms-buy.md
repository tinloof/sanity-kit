---
"@tinloof/sanity-web": minor
---

Add `_SectionProps` to `createSections` for simplified type inference

- The component returned by `createSections` now exposes a `_SectionProps` property that provides fully typed props for each section type
- This eliminates the need for manually constructing `SectionProps` types with generics
- Section components can now use simple bracket notation: `SectionProps["section.hero"]` instead of `SectionProps<"section.hero">`
- Internal type handling updated to avoid circular dependencies when section components import `SectionProps` from the same file that creates the renderer

Example usage:

```tsx
const Sections = createSections<
  NonNullable<PAGE_QUERYResult["sections"]>,
  {locale: string}
>({
  components: {
    "section.hero": HeroSection,
    "section.text": TextSection,
  },
});

// Infer SectionProps directly from the Sections component
type SectionProps = (typeof Sections)["_SectionProps"];

export {Sections, type SectionProps};

// In section components:
export default function HeroSection(props: SectionProps["section.hero"]) {
  // fully typed props
}
```
