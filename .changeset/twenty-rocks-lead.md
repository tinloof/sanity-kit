---
"@tinloof/sanity-studio": minor
---

Add dynamic schema import utilities for better project organization

This release introduces a comprehensive set of utilities for dynamically importing Sanity schemas using Vite's `import.meta.glob()` functionality. These utilities help organize and manage schemas across different directories in your project.

**⚠️ Important:** These utilities only work in standalone Sanity Studio projects. They are not compatible with embedded setups (e.g., Sanity Studio embedded in Next.js apps) as they depend on Vite's build system and `import.meta.glob()` functionality.

### New Features

- **`importAllSchemas()`** - Import all schemas from `/src/schemas/**/*.ts`
- **`importDocumentSchemas()`** - Import document schemas from `/src/schemas/documents/*.ts`
- **`importSectionSchemas()`** - Import section schemas from `/src/schemas/sections/*.ts`
- **`importObjectSchemas()`** - Import object schemas from `/src/schemas/objects/*.ts`
- **`importSingletonSchemas()`** - Import singleton schemas from `/src/schemas/singletons/*.ts`

### Benefits

- **Dynamic loading**: Automatically discover and load schemas without manual imports
- **Better organization**: Organize schemas by type in different directories
- **Type safety**: Full TypeScript support with proper `SchemaTypeDefinition` types
- **Flexible exports**: Supports both default exports and factory function patterns
- **Performance**: Uses dynamic imports for optimal bundle splitting

### Usage Example

```typescript
import {importAllSchemas} from "@tinloof/sanity-studio";

const schemas = await importAllSchemas();

export default defineConfig({
  schema: {
    types: schemas,
  },
});
```

This feature makes it easier to manage large schema collections and provides a cleaner alternative to manually importing each schema file.

### Compatibility

These utilities are designed for standalone Sanity Studio projects and require Vite as the build tool. They will not work in projects where Sanity Studio is embedded into other frameworks (such as Next.js applications) that don't use Vite or don't support `import.meta.glob()`.
