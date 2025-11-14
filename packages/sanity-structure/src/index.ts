import {definePlugin} from "sanity";

declare module "sanity" {
  interface DocumentOptions {
    structure?: any;
  }
}

/**
 * A Sanity plugin that enables document schemas to configure their own structure.
 *
 * @public
 */
export const documentOptionsPlugin = definePlugin({
  name: "tinloof-structure",
  plugins: [],
});
