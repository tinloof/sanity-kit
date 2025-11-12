import {definePage} from "@tinloof/sanity-studio";

export default definePage({
  name: "page",
  title: "Page",
  options: {
    localized: true,
  },
  fields: [
    {
      name: "title",
      type: "string",
    },
  ],
});
