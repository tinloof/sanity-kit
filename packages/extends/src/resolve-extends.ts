import {DocumentDefinition, SchemaTypeDefinition} from "sanity";
import {
  AbstractDefinition,
  AbstractDefinitionResolver,
  ExtendedType,
} from "./types";
import {isResolver, isSchemaType, hasType} from "./type-guards";
import {mergeSchema} from "./merge-schema";

const isExtendsOptionsArrayEntry = (
  value: unknown,
): value is {type: string; parameters?: Record<string, any>} =>
  typeof value === "object" &&
  value !== null &&
  "type" in value &&
  typeof (value as {type: unknown}).type === "string";

const normalizeExtends = (
  ext: DocumentDefinition["extends"],
): [string, boolean | object | undefined][] => {
  if (!ext) return [];
  if (typeof ext === "string") return [[ext, true]];

  if (isExtendsOptionsArrayEntry(ext)) return [[ext.type, ext.parameters]];

  if (Array.isArray(ext)) {
    return ext.map((entry) => {
      if (typeof entry === "string") return [entry, true];
      if (isExtendsOptionsArrayEntry(entry))
        return [entry.type, entry.parameters];
      return [entry, true];
    });
  }
  return [];
};

export function resolveExtends(types: ExtendedType[]): SchemaTypeDefinition[] {
  const resolvers: AbstractDefinitionResolver[] = [];
  const documents: DocumentDefinition[] = [];
  const objects: SchemaTypeDefinition[] = [];
  const documentMap = new Map<string, DocumentDefinition>();
  const typeNames = new Set<string>();

  // Single-pass categorization
  for (const type of types) {
    if (isResolver(type)) {
      resolvers.push(type);
      continue;
    }

    if (!isSchemaType(type)) continue;

    if (type.name) {
      if (typeNames.has(type.name)) {
        throw new Error(`Duplicate type: "${type.name}"`);
      }
      typeNames.add(type.name);
    }

    if (hasType(type, "abstract")) {
      const abstractDef = type as unknown as AbstractDefinition;
      resolvers.push((_doc, _options) => abstractDef);
    } else if (hasType(type, "document")) {
      const doc = type as DocumentDefinition;
      documents.push(doc);
      documentMap.set(doc.name, doc);
    } else {
      objects.push(type);
    }
  }

  const resolveType = (
    name: string,
    rootDocument: DocumentDefinition,
    options?: object | boolean,
  ): DocumentDefinition | AbstractDefinition | undefined => {
    for (const resolver of resolvers) {
      const resolved = resolver(rootDocument, options);
      if (resolved.name === name) return resolved;
    }
    return documentMap.get(name);
  };

  const processExtensions = (
    type: DocumentDefinition | AbstractDefinition,
    rootDocument: DocumentDefinition,
  ): DocumentDefinition | AbstractDefinition => {
    if (!type.extends) return type;

    const extendsList = normalizeExtends(type.extends);

    if (extendsList.some(([name]) => name === type.name)) {
      throw new Error(`A ${type.type} cannot extend itself`);
    }

    let merged = type;
    const visited = new Set<string>([type.name]);

    const processParent = (
      parentName: string,
      options?: object | boolean,
    ): void => {
      if (visited.has(parentName)) {
        throw new Error(
          `Circular dependency detected: ${type.name} extends ${parentName}`,
        );
      }
      visited.add(parentName);

      const parent = resolveType(parentName, rootDocument, options);
      if (!parent) {
        throw new Error(
          `Cannot extend non-existent type "${parentName}" in ${type.type} "${type.name}"`,
        );
      }

      merged = mergeSchema(parent, merged);

      if (parent.extends) {
        normalizeExtends(parent.extends).forEach(([name, opts]) =>
          processParent(name, opts),
        );
      }
    };

    extendsList.forEach(([name, options]) => processParent(name, options));
    return merged;
  };

  const mergedDocuments = documents.map((doc) => processExtensions(doc, doc));

  return [...mergedDocuments, ...objects];
}
