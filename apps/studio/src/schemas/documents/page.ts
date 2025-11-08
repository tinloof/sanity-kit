import {
  definePage,
  newDocumentOptionsRemove,
  newDocumentOptionsRemoveByRole,
} from "@tinloof/sanity-studio";

export default definePage({
  name: "page",
  title: "Page",
  options: {
    newDocumentOptions: (prev, context) => {
      // First remove from global context
      let filtered = newDocumentOptionsRemove(["global"], "page")(
        prev,
        context,
      );

      // Then apply role-based restrictions
      filtered = newDocumentOptionsRemoveByRole("page", {
        administrator: ["structure"],
      })(filtered, context);

      return filtered;
    },
  },
  fields: [
    {
      name: "title",
      type: "string",
    },
  ],
});
