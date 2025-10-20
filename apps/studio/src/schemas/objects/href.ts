import {defineField} from "sanity";

export default defineField({
  description: "e.g. https://example.com or /about-page",
  name: "href",
  title: "URL",
  type: "string",
  validation: (Rule) => Rule.required(),
});

export const hrefPt = defineField({
  name: "hrefPt",
  title: "Link",
  type: "object",
  fields: [{name: "href", type: "href"}],
  preview: {
    select: {
      href: "href",
    },
    prepare: ({href}) => ({
      title: href,
    }),
  },
});
