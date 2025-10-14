import {InputWithCharacterCount} from "@tinloof/sanity-studio";
import {defineField} from "sanity";

export default defineField({
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
      title: "Title",
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
      title: "Short description for SEO & social sharing (meta description)",
      type: "text",
    },
    {
      name: "image",
      title: "Social sharing image",
      type: "image",
    },
  ],
  name: "seo",
  title: "SEO",
  type: "object",
  options: {collapsed: false, collapsible: true},
});
