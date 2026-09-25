---
"@tinloof/sanity-next": minor
"@tinloof/sanity-studio": minor
---

Add an optional per-redirect `keepQueryParameters` boolean, shown as "Keep query parameters" in Studio and defaulting to false. The redirect helper forwards incoming values only when the matched rule explicitly enables it, preserving repeated values for keys absent from the destination. Destination keys take priority; fragments, absolute URLs, status codes and existing lookup behavior remain unchanged.
