import { defineType } from "sanity";

export default defineType({
	name: "modular.page",
	title: "Page",
	type: "document",
	extends: ["page", "i18n"],
	options: {
		structureGroup: "pages",
		localized: true,
	},
	fields: [
		{
			name: "title",
			type: "string",
		},
		{
			name: "sections",
			type: "sectionsBody",
			validation: (Rule) => Rule.required().min(1),
		},
	],
	preview: {
		select: {
			locale: "locale",
			title: "title",
			pathname: "pathname.current",
		},
		prepare: ({ locale, pathname, title }) => ({
			title: `(${locale}) ${title}`,
			subtitle: pathname,
		}),
	},
});
