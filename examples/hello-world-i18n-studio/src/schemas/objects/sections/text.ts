import {defineField, defineType} from "sanity";

export default defineType({
	type: "object",
	name: "section.text",
	title: "Text",
	fields: [
		defineField({
			type: "string",
			name: "text",
			validation: (Rule) => Rule.required(),
		}),
	],
	preview: {
		select: {
			title: "text",
		},
	},
});
