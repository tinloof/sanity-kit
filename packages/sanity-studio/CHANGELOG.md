# @tinloof/sanity-plugin-pages-navigator

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
