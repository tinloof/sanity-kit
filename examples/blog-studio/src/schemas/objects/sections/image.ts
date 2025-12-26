import { defineField, defineType } from "sanity";

export default defineType({
  name: "section.image",
  type: "object",
  title: "Image",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative text",
          description: "Important for SEO and accessibility",
        },
        {
          name: "caption",
          type: "text",
          title: "Caption",
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      alt: "image.alt",
      imageUrl: "image.asset.url",
      caption: "image.caption",
    },
    prepare(selection) {
      const { alt, imageUrl, caption } = selection;

      return {
        title: alt || "Image",
        subtitle: caption || "Section image",
        imageUrl,
      };
    },
  },
});
