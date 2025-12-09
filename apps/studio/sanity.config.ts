import {visionTool} from "@sanity/vision";
import {documentI18n} from "@tinloof/sanity-document-i18n";
import {documentOptions} from "@tinloof/sanity-document-options";
import {withExtends} from "@tinloof/sanity-extends";
import {pages} from "@tinloof/sanity-studio";
import {defineConfig, isDev} from "sanity";
import config from "./config";
import schemas from "./src/schemas";

export default defineConfig({
	name: "sanity-basic-studio",
	title: "Sanity Basic Studio",
	projectId: config.projectId,
	dataset: config.dataset,
	plugins: [
		documentOptions({}),
		documentI18n({
			locales: [
				{id: "en", title: "English"},
				{id: "fr", title: "French"},
			],
		}),
		pages({
			i18n: {
				locales: [
					{id: "en", title: "English"},
					{id: "fr", title: "French"},
				],
				defaultLocaleId: "en",
			},
			creatablePages: ["page"],
			previewUrl: {
				origin: isDev ? "http://localhost:3000" : undefined,
				previewMode: {
					enable: "/api/draft",
				},
			},
			allowOrigins: isDev ? ["http://localhost:3000"] : undefined,
		}),
		visionTool({defaultApiVersion: config.apiVersion}),
	],
	schema: {
		types: withExtends(schemas),
	},
});
