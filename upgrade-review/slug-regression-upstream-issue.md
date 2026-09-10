# regression: slug options.isUnique ignored by inherited validation rules in 6.13

Draft only. Not submitted.

## What

Sanity 6.13.0 and 6.13.1 can ignore a slug field's `options.isUnique` callback and run default uniqueness instead. The same minimal schema works on 6.12.0.

## Reproduction

Create a document schema with a slug field and `options: {isUnique: () => true}`, without an explicit field `validation` function. Compile it with `createSchema`, then call `validateDocument` with a valid slug value and a mock client whose `fetch` returns false. Count the callback and fetch invocations.

Expected: the callback runs once, the default query does not run, and uniqueness succeeds. On 6.13.0/6.13.1, the callback is never called and default uniqueness fails. Reversing the callback and mock response also demonstrates custom rejection being bypassed.

The attached minimal probe and expanded matrix use no Sanity Kit plugin code or live dataset. The matrix also covers named slug aliases and explicit identity validation callbacks.

## Likely cause

Commit `7de17c29494b392553cae32fbf3e9fc010883695` (#14306) moved callback selection from the runtime validation context into `baseRuleReducer`. Builtin slug rules are compiled before the consuming field's custom options are available and can then be inherited unchanged.

## Impact

Custom locale-aware uniqueness can be ignored, preventing translations from sharing a pathname. A custom callback intended to reject a duplicate can also be ignored when default uniqueness succeeds.

## Proposed correction and validation

The accompanying three-file patch defers selection to the final runtime field context while preserving default/custom capability classification. Sixteen targeted patch scenarios pass, including aliases, overrides, nested/array fields, malformed values, exceptions, default delegation and capability modes. A separate Rule-level check confirms default-only slugs are not marked incomplete when custom validation is disabled.

This proposal has been tested against disposable copies of the published package. It has not been run through the full upstream suite or adopted in a released plugin. Please review the classification approach and add the regression cases to the upstream schema/validation tests.
