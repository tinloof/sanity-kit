import {defineType} from "sanity";
import {isUnique} from "../../helpers/is-unique";

export default defineType({
	fields: [
		{
			name: "title",
			title: "Title",
			type: "string",
			validation: (Rule) => Rule.required(),
		},
		{
			name: "slug",
			options: {
				isUnique,
				source: "title",
			},
			title: "Tag's URL-friendly path",
			type: "slug",
		},
	],
	name: "blog.tag",
	preview: {
		select: {
			title: "title",
			subtitle: "slug.current",
		},
	},
	title: "Tag",
	type: "document",
	options: {
		structureGroup: "blog",
	},
});
