import mergeWith from "lodash/mergeWith";
import type { DocumentDefinition } from "sanity";
import type { AbstractDefinition } from "./types";

export function mergeSchema(
	baseSchema: DocumentDefinition | AbstractDefinition,
	extendedSchema: DocumentDefinition | AbstractDefinition,
): DocumentDefinition | AbstractDefinition {
	return {
		...mergeWith({}, baseSchema, extendedSchema, (objValue, srcValue, key) => {
			// For fields, child fields with the same name override parent fields
			if (
				key === "fields" &&
				Array.isArray(objValue) &&
				Array.isArray(srcValue)
			) {
				const childFieldNames = new Set(
					srcValue.map((field: { name: string }) => field.name),
				);
				const filteredParentFields = objValue.filter(
					(field: { name: string }) => !childFieldNames.has(field.name),
				);
				return [...filteredParentFields, ...srcValue];
			}

			if (Array.isArray(objValue) && Array.isArray(srcValue)) {
				return [...objValue, ...srcValue];
			}
		}),
		extends: undefined,
		type: extendedSchema.type,
	} as DocumentDefinition | AbstractDefinition;
}
