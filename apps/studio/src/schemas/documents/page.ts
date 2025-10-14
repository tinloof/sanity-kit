import {definePage} from "@tinloof/sanity-studio";

export default definePage({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    {
      name: "title",
      type: "string",
    },
  ],
});
