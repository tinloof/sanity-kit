/* eslint-disable @typescript-eslint/no-explicit-any */
import {ComponentType} from "react";
import {
  defineField,
  FieldDefinition,
  ObjectFieldProps,
  SlugValidationContext,
  SlugValue,
} from "sanity";

import {PathnameFieldComponent} from "../components/PathnameFieldComponent";
import {PathnameParams} from "../types";

export function definePathname(
  schema: PathnameParams = {name: "pathname"},
): FieldDefinition<"slug"> {
  const slugOptions = schema?.options;

  return defineField({
    ...schema,
    name: schema.name ?? "pathname",
    title: schema?.title ?? "URL",
    type: "slug",
    components: {
      ...schema.components,
      field: (schema.components?.field ??
        PathnameFieldComponent) as unknown as ComponentType<
        ObjectFieldProps<SlugValue>
      >,
    },
    options: {
      ...(slugOptions ?? {}),
      isUnique: slugOptions?.isUnique ?? isUnique,
    },
  });
}

async function isUnique(
  slug: string,
  context: SlugValidationContext,
): Promise<boolean> {
  const {document, getClient, schema} = context;

  const client = getClient({apiVersion: "2023-06-21"});
  const id = document?._id.replace(/^drafts\./, "");

  // Get documents whose pathname field has a prefix
  const documentSchemasWithPrefix =
    schema?._original?.types?.flatMap(
      (type: any) =>
        type.fields
          ?.filter(
            (field) => field.options?.prefix && field.name === "pathname",
          )
          .map((field) => ({
            type: type.name,
            prefix: field.options!.prefix!,
          })) ?? [],
    ) ?? [];

  // Map the document schemas with prefix to a groq filter
  const prefixFilters =
    documentSchemasWithPrefix.length > 0
      ? documentSchemasWithPrefix.map(
          (doc) => /* groq */ `(
        _type == "${doc.type}" &&
        (
          ("/" + "${doc.prefix}" + pathname.current) == $slug ||
          ("/" + "${doc.prefix}" + pathname.current) == $slugWithoutSlash
        )
      )`,
        )
      : [];

  // Find the pathname field which is getting unique validation done
  const documentPathnameField = documentSchemasWithPrefix.find(
    (field) => field.type === document?._type,
  );

  // Create a pathname with prefix if the document has a pathname field with a prefix
  const pathnameWithPrefix = documentPathnameField
    ? `/${documentPathnameField.prefix}${slug}`
    : slug;

  const params = {
    draft: `drafts.${id}`,
    published: id,
    slug: pathnameWithPrefix,
    // Remove slash from end of slug if it exists
    // Handle cases where there is a page with /blog but a new page is created with /blog/
    slugWithoutSlash: pathnameWithPrefix.replace(/\/$/, ""),
    locale: document?.locale ?? null,
  };

  const query = /* groq */ `*[!
    (_id in [$draft, $published])
    && (
      (pathname.current == $slug || pathname.current == $slugWithoutSlash)
      ${prefixFilters.length > 0 ? `|| (${prefixFilters.join(" || ")})` : ""}
    )
    && locale == $locale
    ]`;

  const result = await client.fetch(query, params);
  return result.length === 0;
}
