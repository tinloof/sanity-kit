# @tinloof/sanity-extends

## 1.1.0

### Minor Changes

- 517151b: Fix field merging to correctly handle duplicate field names: child fields now override all parent fields with the same name while preserving duplicates within the same schema
- 2961a35: Add abstract resolvers
- c7491b3: Export the ExtendedAbstract type for use in other packages
- 51862a9: Replace defineAbstract with defineAbstractResolver, and fix type issues

### Patch Changes

- 629c182: Fix return type

## 1.0.1

### Patch Changes

- 0589b51: Fix module import in package.json

## 1.0.0

### Major Changes

- d94e7be: V1 of the sanity-extend utility
