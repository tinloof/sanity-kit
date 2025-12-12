import {defineField, defineType} from "sanity";
import {createPtBody} from "../../helpers/create-pt-body";

export default defineType({
	title: "Post",
	type: "document",
	name: "blog.post",
	extends: [
		{
			type: "page",
			parameters: {
				pathname: {
					options: {folder: {canUnlock: false}, initialValue: "/blog/"},
				},
			},
		},
	],
	options: {
		structureGroup: "blog",
	},
	fields: [
		defineField({
			group: "content",
			name: "publishedAt",
			title: "Publication date",
			type: "date",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			group: "content",
			name: "title",
			type: "string",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			group: "content",
			name: "authors",
			title: "Authors",
			type: "array",
			of: [{type: "reference", to: [{type: "blog.author"}]}],
			validation: (Rule) => Rule.required().min(1),
		}),
		defineField({
			group: "content",
			name: "tags",
			of: [{to: [{type: "blog.tag"}], type: "reference"}],
			type: "array",
			validation: (Rule) => Rule.max(1),
		}),
		defineField({
			...createPtBody({
				annotations: ["link"],
				blocks: ["code", "image", "table"],
				decorators: ["code", "em", "strikeThrough", "strong", "underline"],
				lists: ["bullet", "number"],
				styles: ["normal", "h2", "h3", "h4", "blockquote"],
			}),
			group: "content",
			validation: (Rule) => Rule.required(),
		}),
	],

	preview: {
		select: {
			title: "title",
			subtitle: "pathname.current",
		},
	},
});
