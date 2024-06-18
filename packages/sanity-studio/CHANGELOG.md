# @tinloof/sanity-plugin-pages-navigator

## 1.3.1

### Patch Changes

- 95a15b3: Properly render custom folder titles when i18n is enabled and add ability to have localized folder titles using a callback function.
- 9e62382: Updated dependency `@sanity/presentation` to `^1.16.0`.
  Updated dependency `@sanity/ui` to `^2.4.0`.
  Updated dependency `@sanity/util` to `^3.46.1`.
  Updated dependency `@typescript-eslint/eslint-plugin` to `^7.13.1`.
  Updated dependency `@typescript-eslint/parser` to `^7.13.1`.
  Updated dependency `npm-run-all2` to `^5.0.2`.
  Updated dependency `sanity` to `^3.46.1`.
- Updated dependencies [9e62382]
  - @tinloof/sanity-web@0.4.1

## 1.3.0

### Minor Changes

- a09d24f: Add support for the `source` field, which when set will render a button to generate the pathname similar to Sanity's `Slug` type. Thanks @marcusforsberg!
- 29a848a: Add option to use a custom `localizePathname` function in the Pages plugin and in pathname fields. Thanks @marcusforsberg!
- ac331cf: Add requireLocale option to allow working with non-translatable page types even with i18n enabled. Thanks @marcusforsberg!
- 7dd9046: Add `autoNavigate` option to hide the "Preview" button and automatically navigate as the pathname changes. Thanks @marcusforsberg!
- ab53988: Add `folders` config option which can be used to customize the icons and titles for individual folders based on their pathnames. Thanks @marcusforsberg!

### Patch Changes

- 2a263d7: Hide the "Preview" button from the `pathname` field when used in the Structure Tool (where it has no effect).
- 4289934: Add missing "group" and "fieldset" properties to PathnameParams. Thanks @marcusforsberg!
- 4c92cc8: Updated dependency `@sanity/presentation` to `^1.15.14`.
  Updated dependency `@sanity/ui` to `^2.3.3`.
  Updated dependency `@tanstack/react-virtual` to `^3.5.1`.
  Updated dependency `@types/lodash` to `^4.17.5`.
  Updated dependency `@types/react` to `^18.3.3`.
  Updated dependency `@types/react-is` to `^18.3.0`.
  Updated dependency `@typescript-eslint/eslint-plugin` to `^7.13.0`.
  Updated dependency `@typescript-eslint/parser` to `^7.13.0`.
  Updated dependency `eslint-plugin-react` to `^7.34.2`.
  Updated dependency `eslint-plugin-react-hooks` to `^4.6.2`.
  Updated dependency `npm-run-all2` to `^5.0.0`.
  Updated dependency `prettier` to `^3.3.2`.
  Updated dependency `react` to `^18.3.1`.
  Updated dependency `react-dom` to `^18.3.1`.
  Updated dependency `react-is` to `^18.3.1`.
  Updated dependency `rimraf` to `^5.0.7`.
  Updated dependency `sanity` to `^3.45.0`.
  Updated dependency `styled-components` to `^6.1.11`.
  Updated dependency `@changesets/cli` to `^2.27.5`.
  Updated dependency `@types/react-dom` to `^18.3.0`.
  Updated dependency `tsup` to `^8.1.0`.
  Updated dependency `@portabletext/react` to `^3.1.0`.
- Updated dependencies [29a848a]
- Updated dependencies [4c92cc8]
  - @tinloof/sanity-web@0.4.0

## 1.2.1

### Patch Changes

- a3677bb: - fix(pathname): add back `window.location.origin` as default pathname prefix. Thanks @marcusforsberg!
  - fix(PreviewMedia): add new render condition for when element is of type object. Thanks @gercordero!

## 1.2.0

### Minor Changes

- e5aa2a8: Add prefix option to definePathname. Thanks @Jamiewarb!

### Patch Changes

- 08efb47: Add validation UI to input. Thanks @tamaccount.
- Updated dependencies [8575999]
  - @tinloof/sanity-web@0.3.1

## 1.1.3

### Patch Changes

- c96e9f7: Fix: `definePathname` initialValue is now used when creating new documents from the pages navigator.

## 1.1.2

### Patch Changes

- Updated dependencies [0696902]
  - @tinloof/sanity-web@0.3.0

## 1.1.1

### Patch Changes

- Updated dependencies [5fe8baf]
  - @tinloof/sanity-web@0.2.1

## 1.1.0

### Minor Changes

- e48e6e5: Add `folder.canUnlock` options to `definePathname` helper. Thanks @Jamiewarb for the PR.

  Update `README` with `folder.canUnlock` example.

  Fix `<PathnameFieldComponent />` component trailing dash issue. Thanks @Jamiewarb and @tamaccount.

  Add `<SearchArrayInput />` component to filter array fields.

### Patch Changes

- ec602d8: Update dependencies
- Updated dependencies [e48e6e5]
- Updated dependencies [ec602d8]
  - @tinloof/sanity-web@0.2.0

## 1.0.2

### Patch Changes

- 5beeb0a: Fix folder ListItem rendering

## 1.0.1

### Patch Changes

- b442ca5: Fix pages plugin issues when schemaType is undefined. From now on, pages navigator ListItem will not render if schemaType is undefined.

## 1.0.0

### Major Changes

- 3899f1a: The pages plugin list items now render document icon

## 0.4.1

### Patch Changes

- a09953c: - Add support for preview data, now you can use document schema preview to render pages navigator items preview data
  - Update README
  - Update dependencies
- Updated dependencies [a09953c]
  - @tinloof/sanity-web@0.1.1

## 0.4.0

### Minor Changes

- Rename pagesNavigator to pages + add title plugin option

## 0.3.1

### Patch Changes

- Bug fixes and Sanity upgrade

## 0.3.0

### Minor Changes

- Minor global improvements

## 0.2.1

### Patch Changes

- Fix minor locale bug in PathnameFieldComponent

## 0.2.0

### Minor Changes

- definePathname bug fixes

## 0.1.2

### Patch Changes

- Add config options for navigator

## 0.1.1

### Patch Changes

- Fix: Handle empty pathname and desk tools outside of presentation

## 0.1.0

### Minor Changes

- Initial version

### Patch Changes

- Updated dependencies
  - @tinloof/sanity-web@0.1.0

## 0.1.27

### Patch Changes

- Avoid showing default locale in path

## 0.1.26

### Patch Changes

- Only show locales selector when it makes sense

## 0.1.25

### Patch Changes

- Initial version

## 0.1.0

### Minor Changes

- Initial version
