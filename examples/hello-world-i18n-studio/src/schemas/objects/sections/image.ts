import {defineField, defineType} from "sanity";

export default defineType({
  name: "section.image",
  type: "object",
  title: "Image",
  fields: [
    defineField({
      name: "image",
      type: "image",
      fields: [defineField({name: "alt", type: "string"})],
      options: {hotspot: true},
      validation: (Rule) => Rule.required().assetRequired(),
    }),
  ],
  preview: {
    select: {
      title: "image.alt",
    },
  },
});
