import type { IntrinsicTypeName, SchemaTypeDefinition } from "sanity";
import type { AbstractDefinitionResolver, ExtendedType } from "./types";

export const isResolver = (
	type: ExtendedType,
): type is AbstractDefinitionResolver => typeof type === "function";

export const isSchemaType = (
	type: ExtendedType,
): type is SchemaTypeDefinition<IntrinsicTypeName> =>
	typeof type === "object" && "type" in type;

export const hasType = (
	type: SchemaTypeDefinition,
	typeName: string,
): boolean => type.type === typeName;

export const isExtendsOptionsArrayEntry = (
	value: unknown,
): value is { type: string; parameters?: Record<string, any> } =>
	typeof value === "object" &&
	value !== null &&
	"type" in value &&
	typeof (value as { type: unknown }).type === "string";
