import type {
  NewDocumentOptionsContext,
  SchemaTypeDefinition,
  TemplateItem,
} from "sanity";

import type {DefineDocumentDefinition} from "./define-document";

export default function defineNewDocumentOptions(
  prev: TemplateItem[],
  context: NewDocumentOptionsContext,
): TemplateItem[] {
  const schema = context.schema;
  const allTypes: SchemaTypeDefinition[] =
    (schema?._original?.types || []) ?? [];

  const docsWithConfig = (allTypes as DefineDocumentDefinition[])
    .filter(
      (type) =>
        type.type === "document" &&
        typeof type.options?.newDocumentOptions === "function",
    )
    .map((def) => def.options!.newDocumentOptions!);

  if (!docsWithConfig.length) {
    return prev;
  }

  // Chain all configs: pass `prev` through each one
  return docsWithConfig.reduce((acc, fn) => fn(acc, context), prev);
}
