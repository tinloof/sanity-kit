import {defineCliConfig} from "sanity/cli";

export default defineCliConfig({
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
