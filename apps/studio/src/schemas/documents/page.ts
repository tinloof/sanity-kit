import {definePage} from "@tinloof/sanity-studio";

export default definePage({
  name: "page",
  title: "Page",
  options: {
    structure: {
      group: "pages",
    },
    orderable: true,
  },
  fields: [
    {
      name: "title",
      type: "string",
    },
    {name: "adadw", type: "reference", to: [{type: "home"}]},
  ],
});
