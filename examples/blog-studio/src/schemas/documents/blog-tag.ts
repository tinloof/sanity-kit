import {isUnique} from "@tinloof/sanity-studio";
import {defineType} from "sanity";

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
				isUnique: (value, context) =>
					isUnique(value, context, {
						fieldPath: "slug.current",
						filter: "_type == 'blog.tag'",
					}),
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
