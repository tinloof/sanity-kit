import {defineField} from "sanity";

import {InputWithCharacterCount} from "../../components";

export default defineField({
  components: {
    input: InputWithCharacterCount,
  },
  name: "description",
  options: {
    maxLength: 160,
    minLength: 50,
  },
  title: "Short description for SEO & social sharing (meta description)",
  type: "text",
  rows: 2,
});
