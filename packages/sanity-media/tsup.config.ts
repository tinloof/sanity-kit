import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  platform: "browser",
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "sanity",
    "styled-components",
    "@sanity/ui",
    "@sanity/icons",
  ],
});
