import {defineField} from "sanity";

export default defineField({
	name: "section.logos",
	title: "Logos",
	type: "object",
	fields: [
		defineField({
			name: "title",
			type: "string",
		}),
	],
});
