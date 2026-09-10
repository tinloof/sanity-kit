import {defineConfig} from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm", "cjs"],
	// tsup 8 injects baseUrl internally; only the TS6 declaration pass needs this.
	dts: {compilerOptions: {ignoreDeprecations: "6.0"}},
	clean: true,
	splitting: false,
	sourcemap: true,
	shims: true,
});
