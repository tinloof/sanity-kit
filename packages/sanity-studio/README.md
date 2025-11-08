# @tinloof/sanity-studio

A collection of studio plugins, fields, and components to boost your Sanity studio. This package provides both high-level utilities for rapid development and modular schema components for fine-grained control over your Sanity schemas.

<video controls src="https://github.com/tinloof/sanity-kit/assets/10447155/467e32d2-ded1-47ad-b7f1-85007a941785">
</video>

## Installation

```sh
npm install @tinloof/sanity-studio
```

## Table of contents

- [Table of contents](#table-of-contents)
- [Schema utilities](#schema-utilities)
  - [`definePage`](#definepage)
  - [`defineDocument`](#definedocument)
  - [Document Actions Configuration](#document-actions-configuration)
  - [`defineActions`](#defineactions)
  - [Action Presets](#action-presets)
- [Schema importing utilities](#schema-importing-utilities)
  - [`importAllSchemas`](#importallschemas)
  - [`importDocumentSchemas`](#importdocumentschemas)
  - [`importSectionSchemas`](#importsectionschemas)
  - [`importObjectSchemas`](#importobjectschemas)
  - [`importSingletonSchemas`](#importsingletonschemas)
- [Schema components](#schema-components)
  - [Field groups](#field-groups)
    - [`contentSchemaGroup`](#contentschemagroup)
    - [`settingsSchemaGroup`](#settingsschemagroup)
    - [`mediaSchemaGroup`](#mediaschemagroup)
    - [`navigationSchemaGroup`](#navigationschemagroup)
    - [`ecommerceSchemaGroup`](#ecommerceschemagroup)
    - [`eventsSchemaGroup`](#eventsschemagroup)
    - [`formsSchemaGroup`](#formsschemagroup)
    - [`analyticsSchemaGroup`](#analyticsschemagroup)
    - [`socialSchemaGroup`](#socialschemagroup)
    - [`localizationSchemaGroup`](#localizationschemagroup)
    - [`locationSchemaGroup`](#locationschemagroup)
    - [`themingSchemaGroup`](#themingschemagroup)
  - [Object fields](#object-fields)
  - [Slug fields](#slug-fields)
  - [String fields](#string-fields)
- [Pages](#pages)
  - [Basic usage](#basic-usage)
  - [Enabling page creation](#enabling-page-creation)
  - [Enabling internationalization](#enabling-internationalization)
- [Sections](#sections)
  - [Create a new section schema](#1-create-a-new-section-schema)
  - [Create a sections list array](#2-create-a-sections-list-array)
  - [Add a section picker to your document](#3-add-a-section-picker-to-your-document)
  - [Add sections to your Sanity schema](#4-add-sections-to-your-sanity-schema)
- [`documentI18n`](#documenti18n)
- [`localizedItem`](#localizedItem)
- [`singletonListItem`](#singletonlistitem)
- [Schemas](#schemas)
  - [`iconSchema`](#iconschema)
  - [`redirectsSchema`](#redirectsschema)
- [Disable creation plugin](#disable-creation-plugin)
- [Input with characters count](#input-with-characters-count)

## Schema utilities

These utilities help you create document schemas with common fields and configurations automatically applied.

### `definePage`

The `definePage` utility creates page document schemas with automatic pathname, SEO, and indexable fields. It's perfect for creating page schemas that need URL routing and search engine optimization.

#### Basic usage

```tsx
import {definePage} from "@tinloof/sanity-studio";

export default definePage({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    {
      name: "title",
      type: "string",
      title: "Title",
    },
    {
      name: "content",
      type: "array",
      of: [{type: "block"}],
    },
  ],
});
```

This automatically adds:

- **Pathname field**: For URL routing with i18n support
- **SEO field**: For search engine optimization
- **Indexable field**: To control search engine indexing
- **Internal title field**: For internal document identification
- **Field groups**: Content and settings groups

#### Options

```tsx
export default definePage({
  name: "page",
  title: "Page",
  type: "document",
  options: {
    disableCreation: true, // Disable document creation
    localized: true, // Enable internationalization
    defaultLocaleId: "en", // Default locale for i18n
    orderable: false, // Enable document ordering

    // Field customization options
    internalTitle: "hidden", // Hide internal title (FieldCustomization)

    // Pathname field - can be FieldCustomization or configuration object
    pathname: true, // Show with defaults (FieldCustomization)
    // OR
    pathname: {
      // Direct configuration (PathnameSlugFieldOptions)
      localized: true,
      options: {
        source: "title",
        initialValue: "/",
      },
      hidden: false,
    },

    // SEO field - can be FieldCustomization or configuration object
    seo: "hidden", // Hide entire SEO field (FieldCustomization)
    // OR
    seo: {
      // Configure individual SEO sub-fields (SEOOptions)
      title: "hidden", // Hide SEO title
      description: true, // Show SEO description
      ogImage: false, // Remove OG image completely
      indexableStatus: true, // Show indexable status
    },

    // Configure which document actions are available (same as defineDocument)
    actions: (prev) => prev.filter((action) => action.action !== "delete"),
  },
  fields: [
    // Your custom fields
  ],
});
```

**Note:** The `actions` option works the same way as in `defineDocument`. See the [Document Actions Configuration](#document-actions-configuration) section below for detailed documentation.

### `defineDocument`

The `defineDocument` utility creates document schemas with automatic internal title, locale fields (for i18n), and orderable document list support. It includes content and settings field groups by default. Use this for schemas that do not require SEO or pathname fields.

#### Basic usage

```tsx
import {defineDocument} from "@tinloof/sanity-studio";

export default defineDocument({
  name: "post",
  title: "Blog Post",
  type: "document",
  fields: [
    {
      name: "title",
      type: "string",
      title: "Title",
    },
    {
      name: "content",
      type: "array",
      of: [{type: "block"}],
    },
  ],
});
```

This automatically adds:

- **Internal title field**: For internal document identification
- **Locale field**: For internationalization (when enabled)
- **Order rank field**: For document ordering (when enabled)
- **Field groups**: Content and settings groups

#### Options

```tsx
export default defineDocument({
  name: "tag",
  title: "Blog Tag",
  type: "document",
  options: {
    disableCreation: true, // Disable document creation

    // Field customization with FieldCustomization type
    localized: true, // Show locale field (FieldCustomization)
    orderable: "hidden", // Hide order rank field (FieldCustomization)
    internalTitle: (field) =>
      defineField({
        ...field,
        title: "Tag Name",
        validation: (Rule) => Rule.required(),
      }), // Custom field transformation (FieldCustomization)

    // Configure which document actions are available
    actions: (prev) =>
      prev.filter((action) => !["delete", "duplicate"].includes(action.action)),
  },
  fields: [
    // Your custom fields
  ],
});
```

#### Document Actions Configuration

The `actions` option allows you to customize which document actions (publish, delete, duplicate, etc.) are available in the Sanity Studio for each document type. This is useful for enforcing business rules, adding custom actions, or implementing role-based access control.

You can configure actions using:

1. **Pre-built presets** (recommended for common use cases):

```tsx
import {defineDocument, readOnlyActionsPreset, singletonActionsPreset, noDeleteActionsPreset} from "@tinloof/sanity-studio";

defineDocument({
  name: "settings",
  title: "Settings",
  fields: [...],
  options: {
    actions: readOnlyActionsPreset, // Makes document completely read-only
  },
});

defineDocument({
  name: "homePage",
  title: "Home Page",
  fields: [...],
  options: {
    actions: singletonActionsPreset, // Removes delete/duplicate for singleton docs
  },
});
```

See [Action Presets](#action-presets) section for all available presets.

2. **Custom function** (for dynamic filtering/modification):

```tsx
defineDocument({
  name: "post",
  title: "Post",
  fields: [
    // ... your fields
  ],
  options: {
    actions: (prev, context) => {
      // Remove delete action for published documents
      if (context.published) {
        return prev.filter((action) => action.action !== "delete");
      }
      return prev;
    },
  },
});
```

3. **Array of custom actions** (to add additional actions):

```tsx
import {customPreviewAction, customAnalyticsAction} from "./actions";

defineDocument({
  name: "page",
  title: "Page",
  fields: [
    // ... your fields
  ],
  options: {
    actions: [customPreviewAction, customAnalyticsAction],
  },
});
```

**Function signature:**

- `prev`: Array of existing document action components from Sanity and other plugins
- `context`: Document actions context containing schema information and document data
- **Returns**: Array of document action components

**Common use cases:**

```tsx
// Remove specific actions
actions: (prev) => prev.filter(action => action.action !== 'delete'),

// Add conditional logic
actions: (prev, context) => {
  if (context.currentUser?.role === 'editor') {
    return prev; // Editors get all actions
  }
  return prev.filter(action => action.action !== 'delete');
},

// Combine filtering and custom actions
actions: (prev, context) => [
  ...prev.filter(action => action.action !== 'duplicate'),
  customAction,
],
```

##### Setup

To enable automatic actions configuration, add the `defineActions` resolver to your Sanity Studio configuration:

```tsx
// sanity.config.ts
import {defineActions} from "@tinloof/sanity-studio";

export default defineConfig({
  // ... other config
  document: {
    actions: defineActions, // Automatically applies actions from schema options
  },
});
```

The `defineActions` resolver automatically reads the `actions` configuration from your document schemas (created with `defineDocument` or `definePage`) and applies the appropriate filtering/customization. No additional setup is required once added to your config.

### `defineActions`

A utility function that automatically applies document actions configuration from your schemas to Sanity Studio. This is the resolver function that reads the `actions` option from document schemas created with `defineDocument` and `definePage` and applies the appropriate filtering or customization.

#### Basic usage

```tsx
// sanity.config.ts
import {defineActions} from "@tinloof/sanity-studio";

export default defineConfig({
  // ... other config
  document: {
    actions: defineActions,
  },
});
```

#### How it works

1. **Reads schema configuration**: Automatically detects the `actions` option in your document schemas
2. **Applies function-based config**: If `actions` is a function, calls it with existing actions and context
3. **Appends array-based config**: If `actions` is an array, adds those actions to existing ones
4. **Preserves default behavior**: If no `actions` config exists, leaves actions unchanged

#### Parameters

- `prev`: Array of existing document action components from Sanity and other plugins
- `context`: Document actions context containing schema information and document data

#### Returns

Array of document action components after applying the schema-based configuration.

#### Example with custom logic

```tsx
// In your document schema
defineDocument({
  name: "article",
  title: "Article",
  fields: [...],
  options: {
    actions: (prev, context) => {
      // Remove delete for published articles
      if (context.published) {
        return prev.filter(action => action.action !== 'delete');
      }

      // Remove duplicate for draft articles
      return prev.filter(action => action.action !== 'duplicate');
    },
  },
});

// In your sanity.config.ts
export default defineConfig({
  document: {
    actions: defineActions, // Automatically applies the above logic
  },
});
```

### Action Presets

The package provides several pre-built action presets for common use cases. These presets can be used directly in your `options.actions` configuration without writing custom logic.

#### Available Presets

##### `readOnlyActionsPreset`

Removes all document actions, making the document completely read-only through the Studio UI.

```tsx
import {defineDocument, readOnlyActionsPreset} from "@tinloof/sanity-studio";

defineDocument({
  name: "settings",
  title: "Site Settings",
  fields: [...],
  options: {
    actions: readOnlyActionsPreset,
  },
});
```

##### `singletonActionsPreset`

Perfect for singleton documents (like settings, home page). Removes actions that don't make sense for single-instance documents: `delete`, `duplicate`, and `unpublish`. Keeps `publish`, `discardChanges`, and `restore`.

```tsx
import {defineDocument, singletonActionsPreset} from "@tinloof/sanity-studio";

defineDocument({
  name: "homePage",
  title: "Home Page",
  fields: [...],
  options: {
    actions: singletonActionsPreset,
  },
});
```

##### `noDeleteActionsPreset`

Removes only the delete action while preserving all others. Useful for protecting important documents from accidental deletion.

```tsx
import {defineDocument, noDeleteActionsPreset} from "@tinloof/sanity-studio";

defineDocument({
  name: "article",
  title: "Article",
  fields: [...],
  options: {
    actions: noDeleteActionsPreset,
  },
});
```

##### `publishOnlyActionsPreset`

Only allows publish-related actions: `publish`, `unpublish`, `discardChanges`, and `restore`. Removes management actions like `delete` and `duplicate`. Ideal for content-focused workflows.

```tsx
import {defineDocument, publishOnlyActionsPreset} from "@tinloof/sanity-studio";

defineDocument({
  name: "blogPost",
  title: "Blog Post",
  fields: [...],
  options: {
    actions: publishOnlyActionsPreset,
  },
});
```

##### `byRoleActions`

A preset factory that creates role-based action filtering. Configure different action presets for different user roles.

```tsx
import {
  defineDocument,
  byRoleActions,
  readOnlyActionsPreset,
  publishOnlyActionsPreset,
  singletonActionsPreset
} from "@tinloof/sanity-studio";

const roleBasedActions = byRoleActions({
  administrator: readOnlyActionsPreset,
  editor: (prev, context) => prev, // All actions
  contributor: publishOnlyActionsPreset,
  viewer: singletonActionsPreset,
});

defineDocument({
  name: "article",
  title: "Article",
  fields: [...],
  options: {
    actions: roleBasedActions,
  },
});
```

You can also use custom inline functions for more complex logic:

```tsx
const roleBasedActions = byRoleActions({
  editor: (prev, context) => {
    // Custom logic for editors
    return prev.filter((action) => action.action !== "delete");
  },
  viewer: (prev, context) => {
    // Viewers can only see publish actions
    return prev.filter((action) =>
      ["publish", "unpublish", "discardChanges"].includes(action.action || ""),
    );
  },
});
```

#### Combining Presets

You can also combine presets with custom logic:

```tsx
import {defineDocument, singletonActionsPreset} from "@tinloof/sanity-studio";

defineDocument({
  name: "homePage",
  title: "Home Page",
  fields: [...],
  options: {
    actions: (prev, context) => {
      // First apply singleton preset
      const singletonActions = singletonActionsPreset(prev, context);

      // Then add custom logic
      if (context.currentUser?.role === 'admin') {
        return singletonActions; // Admins get all singleton actions
      }

      // Non-admins can't publish
      return singletonActions.filter(action => action.action !== 'publish');
    },
  },
});
```

## Schema importing utilities

The package provides utilities for dynamically importing Sanity schemas using Vite's `import.meta.glob()` functionality. These utilities help organize and load schemas from different directories in your project.

**⚠️ Compatibility Notice:** These utilities only work in standalone Sanity Studio projects. They are **not compatible** with embedded setups (e.g., Sanity Studio embedded in Next.js apps) as they depend on Vite's build system and `import.meta.glob()` functionality. If you're using Sanity Studio in an embedded setup, you'll need to import your schemas manually.

### `importAllSchemas`

Imports all schemas from all schema directories (`/src/schemas/**/*.ts`).

```typescript
import {importAllSchemas} from "@tinloof/sanity-studio";

// Use in Sanity config
const allSchemas = await importAllSchemas();

export default defineConfig({
  schema: {
    types: allSchemas,
  },
});
```

### `importDocumentSchemas`

Imports schemas specifically from the documents directory (`/src/schemas/documents/*.ts`).

```typescript
import {importDocumentSchemas} from "@tinloof/sanity-studio";

const documentSchemas = await importDocumentSchemas();
```

### `importSectionSchemas`

Imports schemas from the sections directory (`/src/schemas/sections/*.ts`). Useful for page builders and modular content.

```typescript
import {importSectionSchemas} from "@tinloof/sanity-studio";

const sectionSchemas = await importSectionSchemas();

// Use in a sections array field
defineField({
  name: "sections",
  type: "array",
  of: sectionSchemas.map((schema) => ({
    type: schema.name,
  })),
});
```

### `importObjectSchemas`

Imports schemas from the objects directory (`/src/schemas/objects/*.ts`). These represent reusable field groups and complex data structures.

```typescript
import {importObjectSchemas} from "@tinloof/sanity-studio";

const objectSchemas = await importObjectSchemas();
```

### `importSingletonSchemas`

Imports schemas from the singletons directory (`/src/schemas/singletons/*.ts`). These represent unique documents that should only have one instance.

```typescript
import {importSingletonSchemas} from "@tinloof/sanity-studio";

const singletonSchemas = await importSingletonSchemas();

// Use with disable creation plugin
export default defineConfig({
  schema: {
    types: singletonSchemas,
  },
  plugins: [
    disableCreation({
      types: singletonSchemas.map((s) => s.name),
    }),
  ],
});
```

#### Requirements

All schema importing utilities require:

- A standalone Sanity Studio project (not embedded)
- Vite as the build tool (default for Sanity Studio projects)
- Schema files with proper TypeScript/JavaScript exports

These utilities will not work in projects where Sanity Studio is embedded into other frameworks that don't use Vite or support `import.meta.glob()`.

## Schema components

The package now provides modular schema components that can be used independently or as part of the `definePage` and `defineDocument` utilities. These components are organized into categories for better organization and reusability.

### Field Customization

The package introduces a `FieldCustomization` system that allows you to control and customize fields in multiple ways.

#### Field Customization Types

- **`true`** - (default) - Show the field with default configuration
- **`false`** - Completely remove the field from the schema
- **`"hidden"`** - Hide the field but keep it in the schema
- **`(field) => defineField({...field, ...changes})`** - Transform the field with a custom function (always wrap in `defineField` for type safety)

#### Usage Examples

```tsx
// Basic visibility control
internalTitle: true,        // Show field
internalTitle: false,       // Remove field
internalTitle: "hidden",    // Hide field

// Custom transformation - ALWAYS wrap in defineField for type safety
internalTitle: (field) => defineField({
  ...field,
  title: "Custom Internal Title",
  validation: (Rule) => Rule.required(),
}),

// For object fields like SEO, you can also pass configuration options directly
seo: {
  title: "hidden",           // Hide SEO title field
  description: true,         // Show SEO description
  ogImage: false,           // Remove OG image field
  indexableStatus: true,    // Show indexable status
},
```

This system provides fine-grained control over field visibility, configuration, and behavior throughout your Sanity Studio.

**⚠️ Important**: When using the function callback approach, **always wrap your return value in `defineField`** for maximum type safety:

```tsx
// ✅ Correct - wrapped in defineField
myField: (field) => defineField({
  ...field,
  title: "Custom Title",
}),

// ❌ Incorrect - missing defineField wrapper
myField: (field) => ({
  ...field,
  title: "Custom Title",
}),
```

### Field groups

Pre-configured field groups for organizing document fields.

#### `contentSchemaGroup`

A field group for content-related fields with a compose icon.

```tsx
import {contentSchemaGroup} from "@tinloof/sanity-studio";

export default defineType({
  name: "post",
  type: "document",
  groups: [contentSchemaGroup],
  fields: [
    // Your content fields
  ],
});
```

#### `settingsSchemaGroup`

A field group for settings-related fields with a cog icon.

```tsx
import {settingsSchemaGroup} from "@tinloof/sanity-studio";

export default defineType({
  name: "post",
  type: "document",
  groups: [settingsSchemaGroup],
  fields: [
    // Your settings fields
  ],
});
```

#### `mediaSchemaGroup`

A field group for media-related fields with an image icon.

```tsx
import {mediaSchemaGroup} from "@tinloof/sanity-studio";

export default defineType({
  name: "post",
  type: "document",
  groups: [mediaSchemaGroup],
  fields: [
    defineField({
      name: "featuredImage",
      type: "image",
      group: "media",
    }),
  ],
});
```

#### `navigationSchemaGroup`

A field group for navigation-related fields with a link icon.

```tsx
import {navigationSchemaGroup} from "@tinloof/sanity-studio";

export default defineType({
  name: "page",
  type: "document",
  groups: [navigationSchemaGroup],
  fields: [
    defineField({
      name: "menuItems",
      type: "array",
      group: "navigation",
    }),
  ],
});
```

#### `ecommerceSchemaGroup`

A field group for e-commerce-related fields with a tag icon.

```tsx
import {ecommerceSchemaGroup} from "@tinloof/sanity-studio";

export default defineType({
  name: "product",
  type: "document",
  groups: [ecommerceSchemaGroup],
  fields: [
    defineField({
      name: "price",
      type: "number",
      group: "ecommerce",
    }),
  ],
});
```

#### `eventsSchemaGroup`

A field group for event-related fields with a calendar icon.

```tsx
import {eventsSchemaGroup} from "@tinloof/sanity-studio";

export default defineType({
  name: "event",
  type: "document",
  groups: [eventsSchemaGroup],
  fields: [
    defineField({
      name: "eventDate",
      type: "datetime",
      group: "events",
    }),
  ],
});
```

#### `formsSchemaGroup`

A field group for form-related fields with a document icon.

```tsx
import {formsSchemaGroup} from "@tinloof/sanity-studio";

export default defineType({
  name: "contactForm",
  type: "document",
  groups: [formsSchemaGroup],
  fields: [
    defineField({
      name: "formFields",
      type: "array",
      group: "forms",
    }),
  ],
});
```

#### `analyticsSchemaGroup`

A field group for analytics-related fields with a chart icon.

```tsx
import {analyticsSchemaGroup} from "@tinloof/sanity-studio";

export default defineType({
  name: "page",
  type: "document",
  groups: [analyticsSchemaGroup],
  fields: [
    defineField({
      name: "trackingCode",
      type: "string",
      group: "analytics",
    }),
  ],
});
```

#### `socialSchemaGroup`

A field group for social media-related fields with a share icon.

```tsx
import {socialSchemaGroup} from "@tinloof/sanity-studio";

export default defineType({
  name: "post",
  type: "document",
  groups: [socialSchemaGroup],
  fields: [
    defineField({
      name: "socialLinks",
      type: "array",
      group: "social",
    }),
  ],
});
```

#### `localizationSchemaGroup`

A field group for localization-related fields with an earth globe icon.

```tsx
import {localizationSchemaGroup} from "@tinloof/sanity-studio";

export default defineType({
  name: "page",
  type: "document",
  groups: [localizationSchemaGroup],
  fields: [
    defineField({
      name: "translations",
      type: "array",
      group: "localization",
    }),
  ],
});
```

#### `locationSchemaGroup`

A field group for location-related fields with a pin icon.

```tsx
import {locationSchemaGroup} from "@tinloof/sanity-studio";

export default defineType({
  name: "venue",
  type: "document",
  groups: [locationSchemaGroup],
  fields: [
    defineField({
      name: "address",
      type: "string",
      group: "location",
    }),
  ],
});
```

#### `themingSchemaGroup`

A field group for theming-related fields with a color wheel icon.

```tsx
import {themingSchemaGroup} from "@tinloof/sanity-studio";

export default defineType({
  name: "theme",
  type: "document",
  groups: [themingSchemaGroup],
  fields: [
    defineField({
      name: "primaryColor",
      type: "string",
      group: "theming",
    }),
  ],
});
```

### Object fields

Reusable object field definitions for common use cases.

#### `seoObjectField`

A comprehensive SEO object field with configurable sub-fields using the `FieldCustomization` system.

```tsx
import {seoObjectField} from "@tinloof/sanity-studio";

export default defineType({
  name: "post",
  type: "document",
  fields: [
    seoObjectField({
      indexableStatus: true, // Show indexable status (FieldCustomization)
      title: "hidden", // Hide SEO title (FieldCustomization)
      description: (field) =>
        defineField({
          ...field,
          title: "Meta Description",
          validation: (Rule) => Rule.max(160).required(),
        }), // Custom field transformation (FieldCustomization)
      ogImage: false, // Remove OG image completely (FieldCustomization)
    }),
  ],
});
```

The field includes:

- **Indexable status** - Controls search engine indexing
- **SEO title** - With character count validation (15-70 chars)
- **SEO description** - With character count validation (50-160 chars)
- **Social sharing image** - For Open Graph and social media

Each sub-field supports the full `FieldCustomization` system (true, false, "hidden", or transform function).

### Slug fields

Specialized slug field definitions with enhanced functionality.

#### `pathnameSlugField`

A pathname slug field with internationalization and folder support.

```tsx
import {pathnameSlugField} from "@tinloof/sanity-studio";

export default defineType({
  name: "page",
  type: "document",
  fields: [
    pathnameSlugField({
      localized: true, // Enable internationalization
      defaultLocaleId: "en", // Default locale for i18n
      hidden: false, // Show/hide the field
      disableCreation: false, // Disable editing in production
      options: {
        initialValue: "/", // Initial pathname value
        autoNavigate: true, // Auto-navigate in Presentation
        prefix: "/blog", // Pathname prefix
        folder: {
          canUnlock: false, // Disable folder renaming
        },
      },
    }),
  ],
});
```

### String fields

Common string field definitions for document metadata.

#### `internalTitleStringField`

A string field for internal document identification.

```tsx
import {internalTitleStringField} from "@tinloof/sanity-studio";

export default defineType({
  name: "post",
  type: "document",
  fields: [
    internalTitleStringField, // Always includes description and group settings
  ],
});
```

#### `localeStringField`

A hidden string field for locale identification in internationalized documents.

```tsx
import {localeStringField} from "@tinloof/sanity-studio";

export default defineType({
  name: "post",
  type: "document",
  fields: [
    localeStringField, // Hidden field for locale tracking
  ],
});
```

## Pages

Pages is a plugin that wraps [Presentation](https://www.sanity.io/docs/presentation) to display your website pages in a sitemap-like navigation and make it possible to create new ones.

### Basic usage

#### 1. Configure Pages:

```tsx
import {pages} from "@tinloof/sanity-studio";

export default defineConfig({
  // ... other Sanity Studio config
  plugins: [
    pages({
      // Presentation's configuration
      previewUrl: {
        previewMode: {
          enable: "/api/draft",
        },
      },
    }),
  ],
});
```

#### 2. Add a `pathname` field to page schemas using the `definePage` helper:

```tsx
import {definePathname} from "@tinloof/sanity-studio";

export default defineType({
  type: "document",
  name: "modularPage",
  fields: [
    definePathname({
      name: "pathname",
    }),
  ],
});
```

Documents with a defined `pathname` field value are now recognized as pages and are automatically grouped into directories in the pages navigator.

Like Sanity's native `slug` type, the `pathname` supports a `source` option which can be used to generate the pathname from another field on the document, eg. the title:

```tsx
import {definePathname} from "@tinloof/sanity-studio";

export default defineType({
  type: "document",
  name: "modularPage",
  fields: [
    definePathname({
      name: "pathname",
      options: {
        source: "title",
      },
    }),
  ],
});
```

The `source` can also be a function (which can be asynchronous), returning the generated pathname.

### Enabling page creation

Use the `creatablePages` option to define which schema types can be used to create pages.

When a page is created, it will automatically have the current folder in its pathname.

<video controls src="https://github.com/tinloof/sanity-kit/assets/10447155/bd8efb2b-c0cf-45da-bf9b-8a06be9ee620">
</video>

```tsx
import {pages} from "@tinloof/sanity-studio";

export default defineConfig({
  // ... other Sanity Studio config
  plugins: [
    pages({
      // Add any documents you want to be creatable from the pages navigator
      creatablePages: ["page"],
      previewUrl: {
        previewMode: {
          enable: "/api/draft",
        },
      },
    }),
  ],
});
```

### Enabling internationalization

The `i18n` option can be used to support filtering pages by a `locale` field and display internationalized URLs.

When page creation is enabled, the currently selected `locale` is also used as an initial value to create new pages.

Path names are automatically validated to be unique across locales.

<video controls src="https://github.com/tinloof/sanity-kit/assets/10447155/5f6a063d-833c-4e96-8c3b-58e7611f4b43">
</video>

```tsx
import {pages} from "@tinloof/sanity-studio";

const i18nConfig = {
  locales: [
    {id: "en", title: "English"},
    {id: "fr", title: "French"},
  ],
  defaultLocaleId: "en",
};

export default defineConfig({
  // ... other Sanity Studio config
  plugins: [
    pages({
      i18n: i18nConfig,
      previewUrl: {
        previewMode: {
          enable: "/api/draft",
        },
      },
    }),
  ],
});

/**
 * Don't forget to add i18n options and locale field to your document schema
 */
export default defineType({
  type: "document",
  name: "page",
  fields: [
    definePathname({
      name: "pathname",
      options: {
        // Add i18n options
        i18n: {
          enabled: true,
          defaultLocaleId: i18nConfig.defaultLocaleId,
        },
      },
    }),
    // Add locale field
    defineField({
      type: "string",
      name: "locale",
      hidden: true,
    }),
  ],
});
```

### Filtering pages based on user roles

The `filterBasedOnRoles` option can be used to filter pages based on the current user's roles.

```tsx
import {pages} from "@tinloof/sanity-studio";

export default defineConfig({
  // ... other Sanity Studio config
  plugins: [
    pages({
      // Presentation's configuration
      previewUrl: {
        previewMode: {
          enable: "/api/draft",
        },
      },
      filterBasedOnRoles: [
        {role: "all", filter: "!(_id match 'singleton*')"},
        {role: "contributor", filter: "_type == 'blog.post'"},
      ],
    }),
  ],
});
```

This allows you to build upon the base filter, `pathname.current != null`, to filter pages based on the current user's roles.

Setting `role: "all"` will set the filter to all roles while anything else will filter based on the current user's roles.

#### Support documents without a locale

By default, when internationalization is enabled, only pages whose `locale` field matches the currently selected locale will be shown in the list. If you have page types that are not translated but you still want them to show up in the list, you can set the `requireLocale` option to false in your `i18n` config:

```ts
const i18nConfig = {
  locales: [
    {id: "en", title: "English"},
    {id: "fr", title: "French"},
  ],
  defaultLocaleId: "en",
  requireLocale: false,
};
```

Now all documents with a `pathname` field will show up in the list regardless of the filtered locale, even if they don't have a `locale` field (or their `locale` is `null`).

### Lock folder renaming

By default, folders can be renamed. Set the `folder.canUnlock` option to `false` to disable this.

```tsx
import {definePathname} from "@tinloof/sanity-studio";

export default defineType({
  type: "document",
  name: "modularPage",
  fields: [
    definePathname({
      name: "pathname",
      options: {
        folder: {
          canUnlock: false,
        },
      },
    }),
  ],
});
```

### Customizing pages previews

Documents can have their preview customized on the pages navigator using the [List Previews API](https://www.sanity.io/docs/previews-list-views):

```tsx
export default {
  name: "movie",
  type: "document",
  fields: [
    {
      title: "Title",
      name: "title",
      type: "string",
    },
    {
      type: "image",
      name: "image",
      title: "Image",
    },
  ],
  // Preview information
  preview: {
    select: {
      title: "title",
      media: "image",
    },
    prepare({title, image}) {
      return {
        title,
        media: image,
      };
    },
  },
};
```

### Customizing folders

By default, folders will have a folder icon and use the pathname/prefix capitalized as the title. You can customize this for individual folders using the `folders` config option on the plugin:

```tsx
export default defineConfig({
  // ... other Sanity Studio config
  plugins: [
    pages({
      previewUrl: {
        previewMode: {
          enable: "/api/draft",
        },
      },
      folders: {
        "/news": {
          title: "Articles",
          icon: NewspaperIcon,
        },
      },
    }),
  ],
});
```

### Automatically navigate on pathname change

By default, the `pathname` field comes with a "Preview" button which is used to navigate to the page within the Presentation iframe when the pathname changes. You can optionally disable this manual button and have the Presentation tool automatically navigate to the new pathname as it changes:

```tsx
import {definePathname} from "@tinloof/sanity-studio";

export default defineType({
  type: "document",
  name: "modularPage",
  fields: [
    definePathname({
      name: "pathname",
      options: {
        autoNavigate: true,
      },
    }),
  ],
});
```

The Presentation tool will now automatically navigate to the new pathname as the user types, with a 1 second debounce.

## Sections

The `defineSection` field lets you easily define a new section schema. Used in combination with the `SectionsArrayInput` component, it will render a useful section picker in your Sanity documents.

<video controls src="https://github.com/tinloof/sanity-kit/assets/10447155/6215f0b5-0b6e-44e8-bd52-84f59d8d0304">
</video>

#### 1. Create a new section schema

```tsx
// @/sanity/schemas/sections/banner.tsx
export const bannerSection = defineSection({
  name: "block.banner",
  title: "Banner",
  type: "object",
  options: {
    variants: [
      {
        /**
         * Will be used to display a preview image
         * when opening the section picker
         */
        assetUrl: "/images/blocks/hero.png",
      },
    ],
  },
  fields: [
    defineField({
      name: "bannerSection",
      type: "string",
    }),
  ],
});
```

#### 2. Create a sections list array

```tsx
// @/sanity/schemas/sections/index.tsx

import {bannerSection} from "@/sanity/schemas/sections/banner";

export const sections = [bannerSection];
```

#### 3. Add a section picker to your document

Here, the `SectionsArrayInput` component is used to render a useful section picker in your Sanity documents.

```tsx
// @/sanity/schemas/sections/index.tsx

import { sections } = "@/sanity/schemas/sections/index";
import { SectionsArrayInput } from "@tinloof/sanity-studio";

export default defineType({
  name: "page",
  type: "document",
  // ... other fields
  fields: [
    defineField({
      name: 'sectionPicker',
      title: 'Section Picker',
      type: 'array',
      of: sections.map((section) => ({
        type: section.name,
      })),
      components: {
        input: SectionsArrayInput,
      },
    }),
  ]
})
export const sections = [bannerSection];
```

#### 4. Add sections to your Sanity schema

```tsx
// @/sanity/schemas/index.tsx

import {sections} from "@sanity/schemas/index";
import page from "@/sanity/schemas/page";

const schemas = [page, ...sections];

export default schemas;
```

## `documentI18n`

The `documentI18n` plugin is an opinionated thin wrapper around Sanity's [Document Internationalization](https://www.sanity.io/plugins/document-internationalization) that makes it possible to add internationalization without having to specify schema types.
`documentI18n` enables internationalization on any schema with a `locale` field.

Check the `with-i18n` example for instructions on usage.

## `localizedItem`

The `localizedItem` utility helps create localized document lists in your Sanity Studio's structure. It creates a nested list structure that groups documents by locale, with an "All" option to view all documents regardless of locale.

### Basic usage

```tsx
import { localizedItem } from '@tinloof/sanity-studio';
import { StructureResolver } from 'sanity/structure';
import { BookIcon } from '@sanity/icons';

const locales = [
    { id: 'en', title: 'English' },
    { id: 'fr', title: 'French' },
  ];

export const structure: StructureResolver = (S) => {
  return S.list()
    .title('Content')
    .items([
      localizedItem(S, 'blog.post', 'Blog posts', locales, BookIcon),
    ]);
```

### Parameters

- `S`: The Sanity Structure Builder instance
- `name`: The document type name (string)
- `title`: The display title for the list (string)
- `locales`: An array of locale objects with `id` and `title` properties
- `icon`: (Optional) Icon to show instead of the default Sanity folder icon to assist with readability

### Example with additional locale properties

You can include additional properties

```tsx
const locales = [
  {id: "en", title: "English", countryCode: "US", isDefault: true},
  {id: "fr", title: "French", countryCode: "FR"},
];

localizedItem(S, "blog.post", "Blog posts", locales, BookIcon);
```

The utility will create a nested structure with:

- A top-level item with the provided title
- An "All" option showing all documents of the specified type
- Individual locale options that filter documents by their `locale` field

## `singletonListItem`

The `singletonListItem` utility helps create singleton document list items in your Sanity Studio's structure. This is useful for documents that should only have one instance, such as site settings, home pages, or global configuration documents.

### Basic usage

```tsx
import {singletonListItem} from "@tinloof/sanity-studio";
import {StructureResolver} from "sanity/structure";
import {HomeIcon, CogIcon} from "@sanity/icons";

export const structure: StructureResolver = (S) => {
  return S.list()
    .title("Content")
    .items([
      singletonListItem(S, "home", "Home Page"),
      singletonListItem(S, "settings", "Site Settings"),
      // Other list items...
    ]);
};
```

### Parameters

- `S`: The Sanity Structure Builder instance
- `type`: The document type name (string)
- `title`: The display title for the singleton document (string)

### What it does

The `singletonListItem` utility creates a list item that:

- Links directly to a single document of the specified type
- Displays the document in form view only (no list view)
- Uses the provided title as the document title in the interface
- Automatically handles the document creation if it doesn't exist

This is particularly useful for documents like:

- Site settings and configuration
- Home page content
- Global navigation

## Schemas

### `iconSchema`

Builds upon a string field with an options list to show a preview of the icon select as well as other options.

#### Basic usage

```tsx
import {iconSchema} from "@tinloof/sanity-studio";
import {defineType} from "sanity";

export default defineType({
  type: "document",
  name: "page",
  fields: [
    {
      type: "string",
      name: "title",
    },
    {
      ...iconSchema,
      options: {
        list: [
          {title: "Calendar", value: "calendar"},
          {title: "Chat", value: "chat"},
          {title: "Clock", value: "clock"},
        ],
        path: "/icons/select",
        backgroundColor: "black",
      },
    },
  ],
});
```

#### Parameters

- `options.list`: Uses the default string option list type of `{title: string, value: string}[]`
- `options.path`: Path where icons are located
- `options.backgroundColor`: Color value to plug into the CSS style `backgroundColor`. Read [here](https://developer.mozilla.org/en-US/docs/Web/CSS/background-color) for possible values.

### `redirectsSchema`

The `redirectsSchema` field provides a convenient way to manage URL redirects in your Sanity Studio. It includes a searchable interface to filter redirects by source or destination URLs.

#### Basic usage

```tsx
import {redirectsSchema} from "@tinloof/sanity-studio";

export default defineType({
  type: "document",
  name: "settings",
  fields: [
    redirectsSchema,
    // ... other fields
  ],
});
```

#### Features

- **Search functionality**: Filter redirects by source or destination URL
- **Permanent vs temporary redirects**: Toggle between permanent and temporary redirects
- **Visual preview**: Shows redirect type (permanent/temporary) and destination in the list view
- **Required validation**: Both source and destination fields are required

#### Field structure

Each redirect object contains:

- `source` (string, required): The original URL path
- `destination` (string, required): The target URL to redirect to
- `permanent` (boolean, required): Whether the redirect is permanent or temporary

#### Preview

The redirects are displayed in a list format with:

- **Title**: Shows the source URL
- **Subtitle**: Shows the destination URL
- **Media**: Displays the redirect status code

## Disable creation plugin

Plugin to disable the creation of documents with the `disableCreation` option set to true. The plugin does this by:

- limiting the document's action to (these options can be overridden):
  - publish
  - restore
  - discard changes
- removing document type from create button found on the top left of the Studio

### Basic usage

```tsx
sanity.config.ts;

import {disableCreation} from "@tinloof/sanity-studio";
import schemas from "@/sanity/schemas";

export default defineConfig({
  name: "studio",
  title: "Studio",
  projectId: "12345678",
  dataset: "production",
  schema: {
    types: schemas,
  },
  plugins: [disableCreation({schemas: ["home", "header", "footer"]})],
});
```

### Parameters

- `schemas`: String array of document types
- `overrideDocumentActions`: The document actions to override, defaults to publish, discardChanges, restore

### Important notice

When using this plugin, make sure you are placing it after the `structureTool()`.

```tsx
plugins: [
  structureTool(),
  visionTool(),
  disableCreation({
    schemaTypes: schemaTypes as SchemaTypeDefinition[],
  }),
],
```

## Input with characters count

This is a custom component which shows a characters count below a string input. Requires you to specify the minimum and maximum length of the string in order to render and also show tone states.

### Basic usage

Add as a `input` under `components` and include the options `minLength` and `maxLength`.

```tsx
{
  type: 'object',
  name: 'seo',
  fields: [
    {
      type: 'string',
      name: 'title',
      components: {
        input: InputWithCharacterCount,
      },
      options: {
        maxLength: 100,
        minLength: 10,
      },
    },
  ],
},
```

### Parameters

- `minLength`: Number, minimum length of string
- `maxLength`: Number, maximum length of string

## Examples

Check the `/examples` folder.

## License

[MIT](LICENSE) © Tinloof

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hot reload in the studio.
