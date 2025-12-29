import {visionTool} from "@sanity/vision";
import {documentOptions} from "@tinloof/sanity-document-options";
import {withExtends} from "@tinloof/sanity-extends";
import {pages} from "@tinloof/sanity-studio";
import {defineConfig, isDev} from "sanity";
import {table} from "@sanity/table";
import {codeInput} from "@sanity/code-input";
import schemas from "./src/schemas";

import "./globals.css";

export default defineConfig({
	name: "blog",
	title: "Blog",
	projectId: process.env.SANITY_STUDIO_PROJECT_ID || "z3x1z90d",
	dataset: process.env.SANITY_STUDIO_DATASET || "production",
	plugins: [
		table(),
		codeInput(),
		documentOptions({}),
		pages({
			creatablePages: ["blog.post", "modular.page"],
			previewUrl: {
				origin: isDev ? "http://localhost:3000" : undefined,
				previewMode: {
					enable: "/api/draft",
				},
			},
			allowOrigins: isDev ? ["http://localhost:3000"] : undefined,
		}),
		visionTool({
			defaultApiVersion: process.env.SANITY_STUDIO_API_VERSION || "2025-12-01",
		}),
	],
	schema: {
		types: withExtends(schemas),
	},
});
