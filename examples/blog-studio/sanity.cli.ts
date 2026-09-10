import {defineCliConfig} from "sanity/cli";

export default defineCliConfig({
	// CLI 8.9 misidentifies lexorank as ESM when loading the schema.
	vite: {ssr: {external: ["lexorank"]}},
	api: {
		projectId: process.env.SANITY_STUDIO_PROJECT_ID || "z3x1z90d",
		dataset: process.env.SANITY_STUDIO_DATASET || "production",
	},
	project: {
		basePath: "/cms",
	},
	typegen: {
		path: ["../blog-next/app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
	},
});
