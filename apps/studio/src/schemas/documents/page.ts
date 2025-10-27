import {definePage, sectionsBodyArraySchema} from "@tinloof/sanity-studio";

export default definePage({
  name: "page",
  title: "Page",
  fields: [
    {
      name: "title",
      type: "string",
    },
    await sectionsBodyArraySchema(),
  ],
});
