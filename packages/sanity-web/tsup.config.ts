import {defineConfig} from "tsup";

export default defineConfig({
	entry: ["src/**/*.{ts,tsx}"],
	format: ["cjs", "esm"],
	// tsup 8 injects baseUrl internally; only the TS6 declaration pass needs this.
	dts: {compilerOptions: {ignoreDeprecations: "6.0"}},
	outDir: "dist",
});
