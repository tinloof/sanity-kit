import {CogIcon, HomeIcon} from "@sanity/icons";
import {definePage} from "@tinloof/sanity-studio";

export default definePage({
  name: "home",
  title: "Home",
  icon: HomeIcon,
  options: {
    disableCreation: true,
    structure: {
      group: "pages",
      singleton: true,
    },
  },
  fields: [
    {
      name: "title",
      type: "string",
    },
  ],
});
