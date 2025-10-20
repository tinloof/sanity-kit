---
"@tinloof/sanity-studio": minor
---

Add `definePage` and `defineDocument` utilities with comprehensive field customization system.

### New utilities:

- **`definePage`**: Creates page document schemas with automatic pathname, SEO, and indexable fields. Supports internationalization, creation disabling, and custom field grouping.

- **`defineDocument`**: Creates document schemas with automatic internal title, locale fields (for i18n), and orderable document list support. Includes content and settings field groups by default.

### New FieldCustomization System:

Introduces a powerful `FieldCustomization<T>` type system that allows fine-grained control over field behavior:

- **`true`** - Show field with default configuration
- **`false`** - Completely remove field from schema
- **`"hidden"`** - Hide field but keep in schema
- **`(field) => defineField({...field, ...changes})`** - Transform field with custom function (MUST wrap in `defineField` for type safety)

### Enhanced Schema Components:

- **`applyFieldCustomization`**: New utility function for applying field customizations consistently across all schema components
- **`seoObjectField`**: Updated to support individual sub-field customization (title, description, ogImage, indexableStatus) using the FieldCustomization system
- **Field type discrimination**: Intelligent detection between FieldCustomization types and direct configuration objects

### New Schema Fields:

- **SEO-related fields**:
  - `seoTitleStringField` - SEO title with character count validation
  - `seoDescriptionStringField` - SEO description with character count validation
  - `ogImageField` - Social sharing image field
  - `indexableBooleanField` - Search engine indexing control
