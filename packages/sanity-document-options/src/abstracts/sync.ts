import {isDev} from "sanity";
import {defineType} from "sanity";

export default defineType({
  name: "sync",
  type: "abstract",
  options: {
    document: {
      actions: (prev) => {
        return isDev
          ? prev
          : prev.filter(
              (action) =>
                !["delete", "duplicate"].includes(action.action || ""),
            );
      },
      newDocumentOptions: (prev, context) => {
        const {creationContext} = context;

        if (
          !isDev &&
          ["structure", "global", "document"].includes(creationContext.type)
        ) {
          return prev.filter(
            (templateItem) => templateItem.templateId !== context.schemaType,
          );
        }

        return prev;
      },
    },
  },
});
