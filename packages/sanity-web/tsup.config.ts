// tsup.config.ts
import {defineConfig} from "tsup";
import fs from "fs";
import path from "path";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  outDir: "dist",
  clean: true,
  external: ["react", "react-dom", "next", "next-sanity"],
  esbuildOptions(options) {
    // This will scan for files in src/ that start with `"use client"`
    // and add a "banner" so it survives the build.
    const clientFiles = fs
      .readdirSync(path.resolve(__dirname, "src/components"))
      .filter((file) => file.endsWith(".tsx"))
      .map((file) => path.resolve("src/components", file));

    // For esm and cjs separately
    if (!options.banner) options.banner = {};
    options.banner.js = ""; // default no banner

    // Add banner if entry is a client component
    clientFiles.forEach((file) => {
      const content = fs.readFileSync(file, "utf8");
      if (
        content.startsWith('"use client"') ||
        content.startsWith("'use client'")
      ) {
        // Append banner just for those files
        options.banner.js = '"use client";';
      }
    });
  },
});
