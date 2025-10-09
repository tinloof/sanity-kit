import type {DocumentDefinition} from "sanity";
import {defineField, isDev} from "sanity";

import type {PathnameParams} from "../types";
import defineSchema, {DefineSchemaDefinition} from "./define-schema";
import {definePathname} from "./definePathname";
import {InputWithCharacterCount} from "../components/input-with-characters-count";

type PageDefinition = Omit<DocumentDefinition, "options"> & {
  options?: DefineSchemaDefinition["options"] & {
    disableIndexableStatus?: boolean;
    hidePathnameField?: boolean;
    hideSeo?: boolean;
    defaultLocaleId?: string;
  };
  pathnameOptions?: PathnameParams["options"] & {initialValue?: string};
};

export default function definePage(schema: PageDefinition): DocumentDefinition {
  const {initialValue, ...pathnameOptions} = schema.pathnameOptions || {};
  const {options, preview, fields, ...schemaWithoutOptions} = schema;

  return defineSchema({
    ...schemaWithoutOptions,
    fields: [
      defineField({
        ...definePathname({
          options: {
            i18n:
              options?.localized && options?.defaultLocaleId
                ? {
                    defaultLocaleId: options?.defaultLocaleId,
                    enabled: true,
                  }
                : undefined,
            ...pathnameOptions,
          },
        }),
        group: "settings",
        hidden: options?.hidePathnameField,
        readOnly: options?.disableCreation && !isDev,
        initialValue: {current: initialValue},
      }),
      defineField({
        description:
          "Won't show up in Google if set to false, but accessible through URL.",
        group: "settings",
        hidden: options?.disableIndexableStatus,
        initialValue: true,
        name: "indexable",
        type: "boolean",
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "seo",
        title: "SEO",
        type: "object",
        group: "settings",
        hidden: options?.hideSeo,
        options: {collapsed: false, collapsible: true},
        fields: [
          {
            components: {
              input: InputWithCharacterCount,
            },
            name: "title",
            options: {
              maxLength: 70,
              minLength: 15,
            },
            type: "string",
          },
          {
            components: {
              input: InputWithCharacterCount,
            },
            name: "description",
            options: {
              maxLength: 160,
              minLength: 50,
            },
            rows: 2,
            title:
              "Short description for SEO & social sharing (meta description)",
            type: "text",
          },
          {
            description:
              "Highly encouraged for increasing conversion rates for links to this page shared in social media.",
            name: "ogImage",
            options: {
              hotspot: true,
            },
            title: "Social Sharing Image",
            type: "image",
          },
        ],
      }),
      ...fields,
    ].filter(Boolean),
    options: {
      ...(options ?? {}),
    },
    preview: {
      select: {
        subtitle: "pathname.current",
        title: "internalTitle",
      },
      ...preview,
    },
  });
}
