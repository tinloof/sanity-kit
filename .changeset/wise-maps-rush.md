---
"@tinloof/sanity-studio": minor
---

Add templates configuration for fine-grained control over document templates

A comprehensive templates configuration system that allows you to control which templates are available when creating new documents, modify template values, and implement role-based template access control.

- **`defineSchemaTemplates`** - Resolver function for filtering and modifying templates based on schema configuration
- **`TemplatesPolicy`** - Type definition for templates configuration with support for:
  - Boolean values (`true`/`false`) for simple allow/deny
  - `include` - Whitelist specific template IDs
  - `modify` - Modify existing templates by ID (with callbacks or replacement)
  - `add` - Add new templates
  - `byRole` - Role-based template policies
