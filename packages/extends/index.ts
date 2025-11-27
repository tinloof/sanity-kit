import {
  DocumentDefinition,
  IntrinsicTypeName,
  SchemaTypeDefinition,
} from "sanity";
import mergeWith from "lodash/mergeWith";
import {FieldDefinition} from "sanity";

type AbstractDefinition = Omit<DocumentDefinition, "type" | "fields"> & {
  type: "abstract";
  fields?: FieldDefinition<IntrinsicTypeName>[];
};

type AbstractDefinitionResolver = (
  document: DocumentDefinition,
) => AbstractDefinition;

declare module "sanity" {
  export interface IntrinsicDefinitions {
    abstract: AbstractDefinition;
  }
  export interface DocumentDefinition {
    extends?: string[] | string;
  }
}

export type ExtendedAbstractType =
  | SchemaTypeDefinition<IntrinsicTypeName>
  | AbstractDefinitionResolver;

function isAbstractResolver(
  value: ExtendedAbstractType,
): value is AbstractDefinitionResolver {
  return typeof value === "function";
}

export function defineAbstractResolver(
  schema: AbstractDefinitionResolver,
): AbstractDefinitionResolver {
  return schema;
}

function mergeSchema(
  baseSchema: DocumentDefinition | AbstractDefinition,
  extendedSchema: DocumentDefinition | AbstractDefinition,
): DocumentDefinition | AbstractDefinition {
  return {
    ...mergeWith({}, baseSchema, extendedSchema, (objValue, srcValue, key) => {
      if (key == "fields") {
        if (Array.isArray(objValue) && Array.isArray(srcValue)) {
          const childFieldNames = new Set(
            srcValue.map((field: {name: string}) => field.name),
          );

          const filteredParentFields = objValue.filter(
            (field: {name: string}) => !childFieldNames.has(field.name),
          );

          return [...filteredParentFields, ...srcValue];
        }
      }

      if (Array.isArray(objValue) && Array.isArray(srcValue)) {
        return [...objValue, ...srcValue];
      }
    }),
    extends: undefined,
    type: extendedSchema.type,
  } as DocumentDefinition | AbstractDefinition;
}

function resolveExtends(types: ExtendedAbstractType[]): SchemaTypeDefinition[] {
  const typeNames = new Set<string>();

  const resolverList: AbstractDefinitionResolver[] = [];

  for (const type of types) {
    if (isAbstractResolver(type)) {
      resolverList.push(type);
    } else if ("name" in type && type.name) {
      if (typeNames.has(type.name)) {
        throw new Error(`Duplicate type: "${type.name}"`);
      }
      typeNames.add(type.name);
    }
  }

  const abstractMap = new Map<string, AbstractDefinition>();

  for (const type of types) {
    if (
      !isAbstractResolver(type) &&
      typeof type === "object" &&
      "type" in type &&
      type.type === "abstract"
    ) {
      const abstractDef = type as AbstractDefinition;
      abstractMap.set(abstractDef.name, abstractDef);
    }
  }

  const documents = types.filter(
    (type): type is DocumentDefinition =>
      !isAbstractResolver(type) &&
      typeof type === "object" &&
      "type" in type &&
      type.type === "document",
  );

  const documentMap = new Map<string, DocumentDefinition>();
  for (const doc of documents) {
    documentMap.set(doc.name, doc);
  }

  const resolveAbstract = (
    name: string,
    rootDocument: DocumentDefinition,
  ): AbstractDefinition | undefined => {
    const staticAbstract = abstractMap.get(name);
    if (staticAbstract) {
      return staticAbstract;
    }

    for (const resolver of resolverList) {
      const resolved = resolver(rootDocument);
      if (resolved.name === name) {
        return resolved;
      }
    }

    return undefined;
  };

  const processExtensions = (
    type: DocumentDefinition | AbstractDefinition,
    rootDocument: DocumentDefinition,
  ) => {
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

      let baseSchema: DocumentDefinition | AbstractDefinition | undefined;

      baseSchema = resolveAbstract(extendedType, rootDocument);

      if (!baseSchema) {
        baseSchema = documentMap.get(extendedType);
      }

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

  const mergedDocuments = documents.map((doc) => processExtensions(doc, doc));

  for (const [, abstract] of abstractMap) {
    if (abstract.extends) {
      processExtensions(abstract, abstract as unknown as DocumentDefinition);
    }
  }

  const objects = types.filter(
    (type): type is SchemaTypeDefinition =>
      !isAbstractResolver(type) &&
      typeof type === "object" &&
      "type" in type &&
      !["document", "abstract"].includes(type.type),
  );

  return [...mergedDocuments, ...objects];
}

export function withExtends(types: ExtendedAbstractType[]) {
  return (prev: SchemaTypeDefinition[]) => {
    return resolveExtends([...prev, ...types]);
  };
}

export type {AbstractDefinition, AbstractDefinitionResolver};
