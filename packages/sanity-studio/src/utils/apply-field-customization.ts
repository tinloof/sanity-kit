import type {FieldDefinition} from "sanity";

/**
 * Field customization options for controlling field behavior and visibility.
 *
 * T - The field definition type
 *
 * @example
 * ```tsx
 * // Show field with defaults
 * myField: true
 *
 * // Hide field completely
 * myField: false
 *
 * // Hide field but keep in schema
 * myField: "hidden"
 *
 * // Transform field - MUST wrap in defineField for type safety
 * myField: (field) => defineField({
 *   ...field,
 *   title: "Custom Title",
 *   validation: (Rule) => Rule.required(),
 * })
 * ```
 */
export type FieldCustomization<T extends FieldDefinition> =
	| boolean
	| ((field: T) => T)
	| "hidden";

/**
 * Applies field customization to a field definition.
 *
 * @param field - The field definition to customize
 * @param customization - The customization to apply
 * @returns The customized field or null if field should be removed
 *
 * @example
 * ```tsx
 * // Basic usage
 * const customizedField = applyFieldCustomization(myField, "hidden");
 *
 * // With function callback - MUST wrap return in defineField
 * const transformedField = applyFieldCustomization(
 *   myField,
 *   (field) => defineField({
 *     ...field,
 *     title: "Custom Title"
 *   })
 * );
 * ```
 *
 * ⚠️ **Important**: When using function callbacks, always wrap your return value
 * in `defineField()` for maximum type safety.
 */
export function applyFieldCustomization<T extends FieldDefinition>(
	field: T,
	customization: FieldCustomization<T> = true,
): T | null {
	if (typeof customization === "function") {
		return customization(field);
	}

	if (customization === "hidden") {
		return {
			...field,
			hidden: true,
		} as T;
	}

	if (customization === false) {
		return null;
	}

	return field;
}
