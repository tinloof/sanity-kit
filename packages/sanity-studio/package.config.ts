import { defineConfig } from "@sanity/pkg-utils";

export default defineConfig({
  legacyExports: true,
  dist: "dist",
  tsconfig: "tsconfig.build.json",
  external: ["@sanity/ui", "react", "react-dom", "sanity", "styled-components"],
  // Remove this block to enable strict export validation
  extract: {
    rules: {
      "ae-forgotten-export": "off",
      "ae-incompatible-release-tags": "off",
      "ae-internal-missing-underscore": "off",
      "ae-missing-release-tag": "off",
    },
  },
});
