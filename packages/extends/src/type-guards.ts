import {SchemaTypeDefinition, IntrinsicTypeName} from "sanity";
import {AbstractDefinitionResolver, ExtendedType} from "./types";

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
