import {defineCliConfig} from "sanity/cli";

export default defineCliConfig({
	api: {
		projectId: process.env.SANITY_STUDIO_PROJECT_ID || "rnkfj9jg",
		dataset: process.env.SANITY_STUDIO_DATASET || "production",
	},
	project: {
		basePath: "/cms",
	},
});
