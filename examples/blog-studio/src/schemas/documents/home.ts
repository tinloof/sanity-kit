import {defineType} from "sanity";

export default defineType({
	name: "home",
	title: "Home",
	type: "document",
	extends: [
		"singleton",
		{type: "page", parameters: {pathname: {disableCreation: true}}},
	],
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
		prepare: () => ({
			title: `Home`,
		}),
	},
});
