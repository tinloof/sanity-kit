import {defineConfig} from "tsup";

export default defineConfig({
	entry: {
		index: "src/index.ts",
		"components/exit-preview": "src/components/exit-preview.tsx",
		"actions/disable-draft-mode": "src/actions/disable-draft-mode.ts",
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
