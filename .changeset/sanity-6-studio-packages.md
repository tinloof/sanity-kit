---
"@tinloof/sanity-document-i18n": major
"@tinloof/sanity-media": major
"@tinloof/sanity-studio": major
---

Require Sanity 6

These three packages render Studio UI, so they move to `sanity: ^6.0.0` only.
Staying on both majors is not possible from a single build: every Sanity 5
release pins `@sanity/icons ^3.7.4` and `@sanity/ui ^3.x`, Sanity 6 pins
`@sanity/icons ^5.2.1` and `@sanity/ui ^4.0.1`, and neither v3 ships the subpath
exports the v4/v5 APIs require. Stay on 2.x if you are still on Sanity 5.

Peers move to `@sanity/ui ^4.0.0`, `@sanity/icons ^5.0.0` and, for
`@tinloof/sanity-document-i18n`, `@sanity/mutator ^6.0.0`.

Upstream changes absorbed here:

- `@sanity/icons` v5 dropped the named exports from its barrel; every icon now
  imports from its own subpath with the `Icon` suffix stripped from the path
  (`import {CloseIcon} from "@sanity/icons/Close"`). The types still declare the
  old names, so the barrel type-checks and fails at bundle time.
- `@sanity/ui` v4 moved `Menu`, `MenuButton`, `MenuItem`, `MenuDivider` and
  `MenuGroup` to `@sanity/ui/menu`, `Popover` to `/popover`, `Tooltip` to
  `/tooltip`, and `useToast`/`ToastProvider` to `/toast`.
- `@sanity/ui` v4 renamed the `space` prop to `gap` and `Grid`'s `columns`/`rows`
  to `gridTemplateColumns`/`gridTemplateRows`, and replaced `useClickOutside`
  with `useClickOutsideEvent`, which takes a function returning the elements.
- Sanity 6 added `TARGET_NOT_FOUND` to the `duplicate` document operation's
  disabled reasons, and narrowed what `defineType`/`defineArrayMember` return to
  the literal they were given.

Bundled Studio plugins move to their Sanity 6 releases:
`@sanity/document-internationalization` 6, `@sanity/orderable-document-list` 2,
`@sanity/studio-secrets` 4 and `sanity-plugin-utils` 2. `@tinloof/sanity-studio`
now also declares `sanity-plugin-internationalized-array` and
`@sanity/language-filter`, which `@sanity/document-internationalization` 6
requires as peers.
