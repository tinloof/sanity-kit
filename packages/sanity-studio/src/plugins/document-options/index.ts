import {definePlugin} from "sanity";

import defineActions from "./define-actions";

export default definePlugin({
  name: "tinloof-document-options",
  document: {
    actions: defineActions,
  },
});
