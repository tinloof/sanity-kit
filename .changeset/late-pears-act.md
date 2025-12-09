---
"@tinloof/sanity-next": minor
---

fix(sanity-next): pass authenticated client to `defineLive` when custom `live` config is provided\*\*

When passing a custom `live` config to `initSanity()`, `sanityFetch` was broken because the client passed to `defineLive` wasn't configured with the token.

Now we pass `client.withConfig({ token: sanity_api_token })` to `defineLive`, consistent with how the default branch handles it.
