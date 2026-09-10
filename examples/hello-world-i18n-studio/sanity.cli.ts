import {defineCliConfig} from "sanity/cli";

export default defineCliConfig({
	// CLI 8.9 misidentifies lexorank as ESM when loading the schema.
	vite: {ssr: {external: ["lexorank"]}},
	api: {
		projectId: process.env.SANITY_STUDIO_PROJECT_ID || "rnkfj9jg",
		dataset: process.env.SANITY_STUDIO_DATASET || "production",
	},
	project: {
		basePath: "/cms",
	},
});
