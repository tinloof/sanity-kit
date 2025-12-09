import {defineField} from "sanity";

export default defineField({
	name: "section.header",
	title: "Header",
	type: "object",
	fields: [
		defineField({
			name: "title",
			type: "string",
		}),
	],
});
