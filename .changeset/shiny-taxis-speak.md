---
"@tinloof/sanity-web": minor
---

Add portable text utilities and type-safe components

## New Components

- `PortableText`: Type-safe wrapper around `@portabletext/react` with automatic heading slug generation and enhanced TypeScript inference from Sanity typegen
  - Automatically generates slugs for h1-h6 headings for anchor links
  - Infers available blocks, marks, lists, and custom types from your Sanity schema
  - Full autocomplete support for component definitions

## New Utilities

### Portable Text Type Helpers

- `ExtractPtBlockType`: Type utility to extract all custom block type names from a PortableText array (excludes standard "block" type)
- `ExtractPtBlock`: Type utility to extract the full type definition of a specific custom block for component props
- `getPtComponentId`: Runtime utility to generate unique slugs for portable text blocks based on their content

These utilities provide full type safety when building custom portable text components, with autocomplete for all your custom block types.

## New Exports

- `@tinloof/sanity-web/hooks`: Export hooks module for future web-specific hooks

## Dependencies

- Add `next-sanity` as peer dependency (^9 || ^10 || ^11)
- Add `@types/speakingurl` as dev dependency for slug generation types

## Example Usage

```tsx
import { PortableText } from "@tinloof/sanity-web/components/portable-text";
import type { ExtractPtBlock } from "@tinloof/sanity-web/utils";
import type { BLOG_POST_QUERYResult } from "./sanity.types";

type PTBody = NonNullable<BLOG_POST_QUERYResult>["ptBody"];

type PTBodyBlock<TType extends ExtractPtBlockType<PTBody>> = ExtractPtBlock<
  PTBody,
  TType
>;

function ImageComponent(props: PTBodyBlock<"imagePtBlock">) {
  return <img src={props.asset?._ref} alt={props.alt} />;
}

<PortableText<PTBody>
  value={data.ptBody}
  components={{
    types: {
      imagePtBlock: ImageComponent,
    },
  }}
/>;
```
