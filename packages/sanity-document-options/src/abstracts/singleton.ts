import {defineType} from "sanity";

export default defineType({
  name: "singleton",
  type: "abstract",
  options: {
    document: {
      actions: (prev) =>
        prev.filter(
          (action) =>
            !["delete", "duplicate", "unpublish"].includes(action.action || ""),
        ),
      newDocumentOptions: (prev, context) => {
        const {creationContext} = context;

        if (
          ["structure", "global", "document"].includes(creationContext.type)
        ) {
          return prev.filter(
            (templateItem) => templateItem.templateId !== context.schemaType,
          );
        }

        return prev;
      },
    },
    structureOptions: {
      singleton: true,
    },
    schema: {
      templates: [],
    },
  },
  fields: [],
});
