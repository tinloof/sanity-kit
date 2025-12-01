import {defineCliConfig} from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || "rnkfj9jg",
    dataset: process.env.SANITY_STUDIO_DATASET || "production",
  },
  project: {
    basePath: "/cms",
  },
  typegen: {
    path: "./src/**/*.{ts,tsx,js,jsx}",
    schema: "./schema.json",
    generates: "./sanity.generated.d.ts",
    overloadClientMethods: true,
  },
});
