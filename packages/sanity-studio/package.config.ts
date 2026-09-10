import {defineConfig} from "@sanity/pkg-utils";

export default defineConfig({
	dist: "dist",
	tsconfig: "tsconfig.build.json",
	deps: {
		neverBundle: [
			"@sanity/ui",
			"react",
			"react-dom",
			"sanity",
			"styled-components",
		],
	},
	// Remove this block to enable strict export validation
	tsdoc: {
		rules: {
			"ae-incompatible-release-tags": "off",
			"ae-internal-missing-underscore": "off",
			"ae-missing-release-tag": "off",
		},
	},
});
