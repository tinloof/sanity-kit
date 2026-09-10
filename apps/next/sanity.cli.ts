import {defineCliConfig} from "sanity/cli";

/**
 * This app has no Studio of its own. It renders content from
 * `@examples/hello-world-i18n-studio`. The config exists only so the Sanity CLI
 * can find a project root when running `sanity typegen generate`, which reads
 * the studio's extracted `schema.json` (configured below) and registers
 * this app's queries with `@sanity/client`.
 */
export default defineCliConfig({
	typegen: {
		path: "./{app,components,data}/**/*.{ts,tsx}",
		schema: "../../examples/hello-world-i18n-studio/schema.json",
		generates: "./sanity.types.ts",
	},
	api: {
		projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "rnkfj9jg",
		dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
	},
});
