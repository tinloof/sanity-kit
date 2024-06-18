import { definePlugin } from "sanity";

import { CopySectionsAction } from "./CopySectionsAction";

export const copySectionsToClipboard = definePlugin(() => {
  return {
    name: "tinloof-sanity-copy-sections-to-clipboard",
    title: "Sanity i18n",
    document: {
      actions: (prev) =>
        prev.map((previousAction) =>
          previousAction.action === "publish"
            ? CopySectionsAction
            : previousAction
        ),
    },
  };
});
