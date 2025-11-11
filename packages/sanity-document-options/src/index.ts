import {definePlugin} from "sanity";

export const myPlugin = definePlugin(() => {
  // eslint-disable-next-line no-console
  console.log("hello from sanity-plugin-sanity-document-options");
  return {
    name: "sanity-plugin-sanity-document-options",
  };
});
