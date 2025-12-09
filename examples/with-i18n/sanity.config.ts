import {visionTool} from "@sanity/vision";
import {documentI18n} from "@tinloof/sanity-document-i18n";
import {pages} from "@tinloof/sanity-studio";
import {defineConfig} from "sanity";
import {structureTool} from "sanity/structure";
import schemas from "@/sanity/schemas";
import StudioLogo from "./components/StudioLogo";
import config from "./config";

export default defineConfig({
	basePath: config.sanity.studioUrl,
	projectId: config.sanity.projectId,
	dataset: config.sanity.dataset,
	title: config.siteName,
	icon: StudioLogo,
	schema: {
		types: schemas,
	},
	plugins: [
		pages({
			previewUrl: {
				previewMode: {
					enable: "/api/draft",
				},
			},
			creatablePages: ["page"],
			i18n: config.i18n,
		}),
		documentI18n({
			locales: config.i18n.locales,
		}),
		structureTool(),
		visionTool({defaultApiVersion: config.sanity.apiVersion}),
	],
});
