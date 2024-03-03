import {
  FieldDefinition,
  SlugOptions,
  SlugValidationContext,
  defineField,
} from "sanity";
import { PathnameFieldComponent } from "../components/PathnameFieldComponent";

export type PathnameOptions = SlugOptions & {
  i18n?: {
    enabled?: boolean;
    defaultLocaleId?: string;
  };
};

export type PathnameParams = Omit<
  FieldDefinition<"slug">,
  "type" | "options"
> & {
  options?: PathnameOptions;
};

export function definePathname(
  params: PathnameParams = { name: "pathname" }
): FieldDefinition<"slug"> {
  const slugOptions = params?.options;

  return defineField({
    ...params,
    name: params.name ?? "pathname",
    title: params?.title ?? "URL",
    type: "slug",
    components: {
      ...params.components,
      field: params.components?.field ?? PathnameFieldComponent,
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
