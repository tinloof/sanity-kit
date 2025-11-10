---
"@tinloof/sanity-studio": patch
---

Fix pathname prefix handling in pages navigator and preview functionality

This patch addresses several issues related to pathname prefixes in the pages navigator:

- **Fixed preview button navigation**: The preview button in the pathname field component now correctly applies prefixes when navigating to pages, preventing broken links when pathname prefixes are configured
- **Enhanced navigator context with prefix support**: Added automatic detection and application of pathname prefixes from document schema definitions to ensure consistent URL generation throughout the navigator
- **Improved prefix normalization**: Implemented robust prefix handling that prevents double-prefixing and correctly formats URLs with leading/trailing slash management
- **Schema-aware prefix mapping**: The navigator now extracts prefix configurations from document type schemas and applies them consistently across the navigation tree

These changes ensure that when using pathname prefixes (e.g., `/blog` for blog posts), both the preview functionality and navigator display the correct URLs without manual intervention.
