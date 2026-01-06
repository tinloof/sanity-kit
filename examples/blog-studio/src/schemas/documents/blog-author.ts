import {defineField, defineType} from "sanity";

export default defineType({
	fields: [
		defineField({
			name: "name",
			title: "Name",
			type: "string",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "avatar",
			options: {
				hotspot: true,
			},
			title: "Avatar",
			type: "image",
		}),
	],
	name: "blog.author",
	title: "Author",
	type: "document",
	options: {
		structureGroup: "blog",
	},
});
