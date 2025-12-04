import {defineType} from "sanity";

export default defineType(
  {
    name: "i18n",
    type: "abstract",
    fields: [{name: "locale", type: "string", hidden: true}],
    options: {
      localized: true,
    },
  },
  {strict: false},
);
