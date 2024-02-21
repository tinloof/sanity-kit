import {
  FieldDefinition,
  SlugDefinition,
  SlugValidationContext,
  defineField,
} from "sanity";
import { PathnameFieldComponent } from "../components/PathnameFieldComponent";

export type PathnameOptions = SlugDefinition["options"] & {
  defaultLocaleId?: string;
  title?: string;
};

export function definePathname(
  params: PathnameOptions = {}
): FieldDefinition<"slug"> {
  const { title = "URL", ...options } = params;

  return defineField({
    name: "pathname",
    type: "slug",
    title,
    components: {
      field: PathnameFieldComponent,
    },
    options: {
      ...(options ?? {}),
      isUnique: options.isUnique ?? isUnique,
    },
  });
}

async function isUnique(
  slug: string,
  context: SlugValidationContext
): Promise<boolean> {
  const { document, getClient } = context;
  const client = getClient({ apiVersion: "2023-06-21" });
  const id = document._id.replace(/^drafts\./, "");
  const params = {
    draft: `drafts.${id}`,
    published: id,
    slug,
    locale: document.locale ?? null,
  };
  const query = `*[!(_id in [$draft, $published]) && pathname.current == $slug && locale == $locale]`;
  const result = await client.fetch(query, params);
  return result.length === 0;
}
