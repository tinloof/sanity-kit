import {defineType} from "sanity";

export default defineType({
  name: "page",
  title: "Page",
  extends: {abstract: "page", pathname: {autoNavigate: true}},
  type: "document",
  fields: [
    {
      name: "title",
      type: "string",
    },
    {name: "locale", type: "string"},
  ],
});
