import {HomeIcon} from "@sanity/icons";
import {defineType} from "sanity";

export default defineType({
  name: "home",
  title: "Home",
  type: "document",
  icon: HomeIcon,
  options: {
    disableCreation: true,
    structureGroup: "pages",
    structureOptions: {
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
