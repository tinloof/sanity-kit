import {definePage} from "@tinloof/sanity-studio";

export default definePage({
  name: "page",
  title: "Page",
  options: {
    localized: true,
    templates: {
      byRole: {administrator: false},
    },
  },
  fields: [
    {
      name: "title",
      type: "string",
    },
  ],
});
