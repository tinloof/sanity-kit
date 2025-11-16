import {defineType} from "sanity";

import {localeStringField} from "../../schemas";

export default defineType({
  name: "localized",
  type: "abstract",
  options: {
    localized: true,
  },
  fields: [{...localeStringField, hidden: true}],
});
