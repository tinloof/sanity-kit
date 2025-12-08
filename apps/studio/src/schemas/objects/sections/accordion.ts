import { defineArrayMember, defineField, defineType } from "sanity";
import createPtBody from "../../../helpers/create-pt-body";

export default defineType({
	name: "section.accordion",
	type: "object",
	title: "Accordion",
	fields: [
		defineField({
			name: "title",
			type: "string",
		}),
		defineField({
			name: "accordion",
			type: "array",
			title: "Accordion",
			of: [
				defineArrayMember({
					type: "object",
					name: "accordion",
					fields: [
						defineField({
							name: "title",
							type: "string",
						}),
						defineField({
							...createPtBody({ annotations: ["href"] }),
							name: "content",
							validation: (Rule) => Rule.required(),
						}),
					],
				}),
			],
			validation: (Rule) => Rule.required().min(1),
		}),
	],
	preview: {
		select: {
			title: "title",
		},
	},
});
