---
"@tinloof/sanity-web": major
---

Update Portable Text to version 8, Sanity client to version 8, and asset/image utilities to their current major versions. Require Sanity 6.12 or later within major 6 (`^6.12.0`), drop Sanity 5 support, and require next-sanity 13.3.4 or later within major 13 (`^13.3.4`). Drop next-sanity 12 support. Require React and React DOM 19.2.4 or later within major 19.

Portable Text preserves authored list-level jumps, including intermediate list containers, and parent numbering. Review custom renderers against representative nested content before upgrading. No content migration is performed. Build both ESM and CommonJS entry points for the published subpaths.
