import {DocumentDefinition, SchemaTypeDefinition} from "sanity";
import mergeWith from "lodash/mergeWith";

type AbstractDefinition = Omit<DocumentDefinition, "type"> & {
  type: "abstract";
};

declare module "sanity" {
  export interface IntrinsicDefinitions {
    abstract: AbstractDefinition;
  }
  export interface DocumentDefinition {
    extends?: string[] | string;
  }
}

function mergeSchema(
  baseSchema: DocumentDefinition | AbstractDefinition,
  extendedSchema: DocumentDefinition | AbstractDefinition,
): DocumentDefinition | AbstractDefinition {
  return {
    ...mergeWith({}, baseSchema, extendedSchema, (objValue, srcValue) => {
      if (Array.isArray(objValue) && Array.isArray(srcValue)) {
        return [...objValue, ...srcValue];
      }
    }),
    extends: undefined,
    type: extendedSchema.type,
  };
}

export function resolveExtends(types: SchemaTypeDefinition[]) {
  // Check for duplicate type names
  const typeNames = new Set<string>();
  for (const type of types) {
    if (typeNames.has(type.name)) {
      throw new Error(`Duplicate type: "${type.name}"`);
    }
    typeNames.add(type.name);
  }

  const abstracts = types.filter(
    (type): type is AbstractDefinition => type.type === "abstract",
  );

  const documents = types.filter(
    (type): type is DocumentDefinition => type.type === "document",
  );

  const allExtendable = [...documents, ...abstracts];

  const processExtensions = (type: DocumentDefinition | AbstractDefinition) => {
    if (!type.extends) return type;

    const extendedTypes = Array.isArray(type.extends)
      ? type.extends
      : [type.extends];

    if (extendedTypes.includes(type.name))
      throw new Error(`A ${type.type} cannot extend itself`);

    let merged = type;
    const visited = new Set<string>([type.name]);

    const processExtendedType = (extendedType: string): void => {
      if (visited.has(extendedType)) {
        throw new Error(
          `Circular dependency detected: ${type.name} extends ${extendedType}`,
        );
      }

      visited.add(extendedType);

      const baseSchema = allExtendable.find(({name}) => name === extendedType);

      if (!baseSchema) {
        throw new Error(
          `Cannot extend non-existent type "${extendedType}" in ${type.type} "${type.name}"`,
        );
      }

      merged = mergeSchema(baseSchema, merged);

      if (baseSchema.extends) {
        const baseExtendedTypes = Array.isArray(baseSchema.extends)
          ? baseSchema.extends
          : [baseSchema.extends];

        for (const baseExtendedType of baseExtendedTypes) {
          processExtendedType(baseExtendedType);
        }
      }
    };

    for (const extendedType of extendedTypes) {
      processExtendedType(extendedType);
    }

    return merged;
  };

  const mergedDocuments = documents.map(processExtensions);
  abstracts.forEach(processExtensions);

  const objects = types.filter(
    ({type}) => !["document", "abstract"].includes(type),
  );

  return [...mergedDocuments, ...objects];
}

export function withExtends(types: SchemaTypeDefinition[]) {
  return (prev: SchemaTypeDefinition[]) => {
    return resolveExtends([...prev, ...types]);
  };
}
