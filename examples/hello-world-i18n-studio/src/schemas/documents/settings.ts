import { redirectsSchema, seoObjectField } from "@tinloof/sanity-studio";
import { defineField, defineType } from "sanity";

export default defineType({
	name: "settings",
	type: "document",
	extends: ["singleton"],
	fields: [
		defineField({
			...seoObjectField({ indexableStatus: false }),
			group: undefined,
			name: "globalSeo",
			title: "Global fallback SEO",
			description:
				"Will be used as the fallback SEO for all pages that don't define a custom SEO in their SEO fields.",
		}),
		redirectsSchema,
	],
	preview: {
		select: {
			locale: "locale",
		},
		prepare: ({ locale }) => ({
			title: `(${locale}) Settings`,
		}),
	},
});
