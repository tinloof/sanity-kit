import type {defineField} from "sanity";

/**
 * Represents a Sanity field definition created via defineField
 */
export type FieldType = ReturnType<typeof defineField>;

/**
 * Defines the possible ways to override a field:
 * - `false`: Removes the field entirely
 * - `function`: Transforms the field using a callback
 * - `object`: Shallow merges properties into the field
 */
export type FieldOverride =
  | false
  | ((field: FieldType) => FieldType)
  | Partial<FieldType>;

/**
 * Applies field overrides to an array of Sanity fields.
 *
 * This utility allows you to modify, remove, or transform existing fields
 * in a declarative way. It's particularly useful for customizing default
 * fields added by schema helpers like `definePage` and `defineDocument`.
 *
 * @param fields - Array of fields created via defineField
 * @param overrides - Record where each key corresponds to a field name and each value can be:
 *   - `false` to remove the field entirely
 *   - A function `(field) => modifiedField` to transform the field
 *   - A partial object to shallow-merge into the field
 * @returns The transformed field array with removed fields filtered out
 *
 * @example
 * ```typescript
 * const fields = [
 *   defineField({name: "title", type: "string"}),
 *   defineField({name: "description", type: "text"}),
 * ];
 *
 * const modified = applyFieldOverrides(fields, {
 *   title: {validation: (Rule) => Rule.required()},
 *   description: false, // Remove this field
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Using a function to transform a field
 * const modified = applyFieldOverrides(fields, {
 *   title: (field) => ({
 *     ...field,
 *     title: "Custom Title",
 *     validation: (Rule) => Rule.required().min(3),
 *   }),
 * });
 * ```
 */
export function applyFieldOverrides(
  fields: FieldType[],
  overrides: Record<string, FieldOverride>,
): FieldType[] {
  return fields
    .map((field) => {
      if (!field?.name || !(field.name in overrides)) {
        return field;
      }

      const override = overrides[field.name];

      // Remove field if override is false
      if (override === false) {
        return null;
      }

      // Apply function transformation
      if (typeof override === "function") {
        return override(field);
      }

      // Shallow merge partial object
      return {
        ...field,
        ...override,
      };
    })
    .filter(Boolean) as FieldType[];
}
