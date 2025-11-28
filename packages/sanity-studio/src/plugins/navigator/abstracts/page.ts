import {defineAbstractResolver} from "@tinloof/sanity-extends";
import {defineType} from "sanity";

import {
  contentSchemaGroup,
  pathnameSlugField,
  seoObjectField,
  settingsSchemaGroup,
} from "../../../schemas";

export default defineAbstractResolver((_schema, options) => {
  return defineType({
    name: "page",
    type: "abstract",
    groups: [contentSchemaGroup, settingsSchemaGroup],
    fields: [
      {
        ...seoObjectField({}),
        group: "settings",
      },
      {
        ...pathnameSlugField({
          disableCreation: options?.pathname?.disableCreation,
          localized: !!options?.i18n?.locales?.length,
          defaultLocaleId: options?.i18n?.defaultLocale,
          options: options?.pathname,
        }),
        group: "settings",
      },
    ],
  });
});
