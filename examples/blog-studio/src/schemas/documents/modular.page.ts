import {defineType} from "sanity";

export default defineType({
	name: "modular.page",
	title: "Page",
	type: "document",
	extends: ["page"],
	options: {
		structureGroup: "pages",
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
			title: "title",
			pathname: "pathname.current",
		},
		prepare: ({pathname, title}) => ({
			title: `${title}`,
			subtitle: pathname,
		}),
	},
});
