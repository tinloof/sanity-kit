import {CogIcon, HomeIcon} from "@sanity/icons";
import {definePage} from "@tinloof/sanity-studio";

export default definePage({
  name: "page",
  title: "Page",
  options: {
    structure: {
      group: "pages",
      views: (S) => [
        S.view.form().title("Home Form").id("home-form").icon(HomeIcon),
        S.view.form().title("Another Form").id("another-form").icon(CogIcon),
      ],
    },
  },
  fields: [
    {
      name: "title",
      type: "string",
    },
  ],
});
