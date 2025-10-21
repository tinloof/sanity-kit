import {definePage} from "@tinloof/sanity-studio";

export default definePage({
  name: "home",
  title: "Home",
  options: {
    disableCreation: true,
  },
  fields: [
    {
      name: "title",
      type: "string",
    },
  ],
});
