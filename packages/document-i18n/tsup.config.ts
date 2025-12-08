import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm", "cjs"],
	dts: true,
	clean: true,
	splitting: false,
	sourcemap: true,
	shims: true,
	platform: "browser",
	external: ["react", "react-dom", "styled-components", "@sanity/ui"],
});
