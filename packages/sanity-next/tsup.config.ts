import {defineConfig} from "tsup";

export default defineConfig({
	entry: {
		index: "src/index.ts",
		"components/exit-preview": "src/components/exit-preview.tsx",
		"components/sanity-image": "src/components/sanity-image.tsx",
		"components/infinite-scroll": "src/components/infinite-scroll.tsx",
		"components/infinite-scroll-base":
			"src/components/infinite-scroll-base.tsx",
		"actions/disable-draft-mode": "src/actions/disable-draft-mode.ts",
		"hooks/index": "src/hooks/index.ts",
		"client/index": "src/client/index.ts",
		"client/create-client": "src/client/create-client.ts",
		"client/init": "src/client/init.ts",
		// package.json has declared ./utils, ./utils/sanity, ./utils/urls and
		// ./utils/sitemap all along, but without these entries no dist/utils was
		// built and every one of those subpaths failed to resolve.
		"utils/index": "src/utils/index.ts",
		"utils/sanity": "src/utils/sanity.ts",
		"utils/urls": "src/utils/urls.ts",
		"utils/sitemap": "src/utils/sitemap.ts",
	},
	format: ["esm", "cjs"],
	dts: true,
	clean: true,
	splitting: false,
	sourcemap: true,
	shims: true,
	platform: "browser",
	external: ["react", "react-dom"],
});
