import {defineType} from "sanity";

export default defineType({
	fields: [
		{
			name: "sections",
			type: "sectionsBody",
			validation: (Rule) => Rule.required().min(1),
		},
	],
	name: "blog.index",
	preview: {
		select: {
			title: "title",
			pathname: "pathname.current",
		},
	},
	title: "Blog index",
	type: "document",
	options: {structureGroup: "blog", structureOptions: {title: "Index"}},
	extends: [
		{type: "page", parameters: {pathname: {disableCreation: true}}},
		{
			type: "singleton",
			parameters: {id: "e87ee5ae-b03c-42a6-8543-71335215a323"},
		},
	],
});
