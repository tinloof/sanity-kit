import {defineField} from "sanity";
import {
	defaultPTDecorators as decorators,
	defaultPTLists as lists,
	defaultPTStyles as styles,
	definePortableTextFactory,
} from "@tinloof/sanity-studio";

const blocks = {
	image: defineField({
		type: "image",
		name: "imagePtBlock",
		title: "Image",
		options: {hotspot: true},
		validation: (Rule) => Rule.required().assetRequired(),
		fields: [
			defineField({name: "alt", type: "string"}),
			defineField({
				name: "caption",
				type: "string",
			}),
		],
	}),
	code: defineField({
		type: "code",
		name: "code",
		title: "Code",
		validation: (Rule) => Rule.required(),
	}),
	table: defineField({
		type: "table",
		name: "table",
		validation: (Rule) => Rule.required(),
	}),
} as const;

const annotations = {
	link: defineField({
		name: "link",
		type: "object",
		title: "link",
		fields: [
			defineField({
				description: "e.g. https://example.com or /about-page",
				name: "url",
				title: "URL",
				type: "string",
				validation: (Rule) => Rule.required(),
			}),
		],
	}),
} as const;

export const createPtBody = definePortableTextFactory({
	blocks,
	annotations,
	lists,
	styles,
	decorators,
});
