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
  options?: {[key: string]: any},
) => AbstractDefinition;

export type BaseExtends = string;

export type PluginExtends = ExtendsWith[keyof ExtendsWith];

export type ExtendsEntry = BaseExtends | PluginExtends;

export type Extends = ExtendsEntry | ExtendsEntry[];

declare module "sanity" {
  export interface IntrinsicDefinitions {
    abstract: AbstractDefinition;
  }
  export interface DocumentDefinition {
    extends?: Extends;
  }
}

// Allow interface merging for plugin-specific extends
declare module "@tinloof/sanity-extends" {
  export interface ExtendsWith {}
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
    options?: {[key: string]: any},
  ): AbstractDefinition | undefined => {
    const staticAbstract = abstractMap.get(name);
    if (staticAbstract) {
      return staticAbstract;
    }

    for (const resolver of resolverList) {
      const resolved = resolver(rootDocument, options);
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

    // Check for self-extension
    for (const extendedType of extendedTypes) {
      const abstractName =
        typeof extendedType === "string"
          ? extendedType
          : (extendedType as any).abstract;
      if (abstractName === type.name) {
        throw new Error(`A ${type.type} cannot extend itself`);
      }
    }

    let merged = type;
    const visited = new Set<string>([type.name]);

    const processExtendedType = (
      extendedType: ExtendsEntry,
      options?: {[key: string]: any},
    ): void => {
      const abstractName =
        typeof extendedType === "string"
          ? extendedType
          : (extendedType as any).abstract;

      const extendOptions =
        typeof extendedType === "string"
          ? options || {}
          : {...(extendedType as any), abstract: undefined};

      if (visited.has(abstractName)) {
        throw new Error(
          `Circular dependency detected: ${type.name} extends ${abstractName}`,
        );
      }

      visited.add(abstractName);

      let baseSchema: DocumentDefinition | AbstractDefinition | undefined;

      baseSchema = resolveAbstract(abstractName, rootDocument, extendOptions);

      if (!baseSchema) {
        baseSchema = documentMap.get(abstractName);
      }

      if (!baseSchema) {
        throw new Error(
          `Cannot extend non-existent type "${abstractName}" in ${type.type} "${type.name}"`,
        );
      }

      // Apply extension options to the base schema
      let extendedBaseSchema = baseSchema;
      if (Object.keys(extendOptions).length > 0) {
        extendedBaseSchema = {
          ...baseSchema,
          ...extendOptions,
        };
      }

      merged = mergeSchema(extendedBaseSchema, merged);

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

/**
 * Generic utility for resolving abstract schema types from configuration
 *
 * @param abstractSchemaMap - Map of abstract keys to their schema definitions
 * @param abstracts - Configuration object specifying which abstracts to enable
 * @param options - Optional configuration passed to abstract resolvers
 * @returns Array of enabled abstract schema types
 *
 * @example
 * ```ts
 * const schemaMap = {
 *   singleton: singletonAbstract,
 *   sync: syncAbstract,
 * } as const;
 *
 * const abstracts = { singleton: true, sync: false };
 * const types = resolveAbstractSchemaTypes(schemaMap, abstracts);
 * ```
 */
export function resolveAbstractSchemaTypes<
  T extends Record<string, ExtendedAbstractType>,
>(
  abstractSchemaMap: T,
  abstracts: Record<string, any> | false = {},
  options?: any,
): ExtendedAbstractType[] {
  if (abstracts === false) return [];

  const enabledAbstracts: ExtendedAbstractType[] = [];

  // Iterate through the abstracts configuration
  Object.entries(abstracts).forEach(([key, enabled]) => {
    if (enabled && key in abstractSchemaMap) {
      const abstractResolver = abstractSchemaMap[key as keyof T];

      // If options are provided and the resolver is a function, wrap it
      if (options && typeof abstractResolver === "function") {
        const wrappedResolver = (
          schema: DocumentDefinition,
          resolverOptions: any = {},
        ) => {
          return abstractResolver(schema, {...resolverOptions, ...options});
        };
        enabledAbstracts.push(wrappedResolver);
      } else {
        enabledAbstracts.push(abstractResolver);
      }
    }
  });

  return enabledAbstracts;
}

export type {AbstractDefinition, AbstractDefinitionResolver};
