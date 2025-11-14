import {HomeIcon} from "@sanity/icons";
import {defineType} from "sanity";

export default defineType({
  name: "home",
  title: "Home",
  type: "document",
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
