import {definePlugin} from "sanity";

import defineActions from "./define-actions";
import defineNewDocumentOptions from "./define-new-doucment-options";

export default definePlugin({
  name: "tinloof-document-options",
  document: {
    actions: defineActions,
    newDocumentOptions: defineNewDocumentOptions,
  },
});
