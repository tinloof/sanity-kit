import { defineField, FieldDefinition, SlugValidationContext } from "sanity";

import { PathnameFieldComponent } from "../components/PathnameFieldComponent";
import { PathnameParams } from "../types";

export function definePathname(
  schema: PathnameParams = { name: "pathname" }
): FieldDefinition<"slug"> {
  const slugOptions = schema?.options;

  return defineField({
    ...schema,
    name: schema.name ?? "pathname",
    title: schema?.title ?? "URL",
    type: "slug",
    components: {
      ...schema.components,
      field: schema.components?.field ?? PathnameFieldComponent,
    },
    options: {
      ...(slugOptions ?? {}),
      isUnique: slugOptions?.isUnique ?? isUnique,
    },
  });
}

async function isUnique(
  slug: string,
  context: SlugValidationContext
): Promise<boolean> {
  const { document, getClient } = context;
  const client = getClient({ apiVersion: "2023-06-21" });
  const id = document?._id.replace(/^drafts\./, "");
  const params = {
    draft: `drafts.${id}`,
    published: id,
    slug,
    locale: document?.locale ?? null,
  };
  const query = `*[!(_id in [$draft, $published]) && pathname.current == $slug && locale == $locale]`;
  const result = await client.fetch(query, params);
  return result.length === 0;
}
