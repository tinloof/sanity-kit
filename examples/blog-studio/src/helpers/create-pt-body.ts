import {defineField, defineArrayMember} from "sanity";

const AVAILABLE_STYLES = {
	normal: "Normal",
	h1: "H1",
	h2: "H2",
	h3: "H3",
	h4: "H4",
	h5: "H5",
	h6: "H6",
	blockquote: "Blockquote",
};

const AVAILABLE_BLOCKS = {
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

const AVAILABLE_INNER_BLOCKS = {} as const;

const AVAILABLE_LISTS = {
	bullet: {title: "Bullet list", value: "bullet"},
	number: {title: "Numbered list", value: "number"},
} as const;

const AVAILABLE_DECORATORS = {
	strong: {title: "Strong", value: "strong"},
	em: {title: "Emphasis", value: "em"},
	underline: {title: "Underline", value: "underline"},
	strikeThrough: {title: "Strike through", value: "strike-through"},
	code: {title: "Code", value: "code"},
} as const;

const AVAILABLE_ANNOTATIONS = {
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

type PtBodyProps = {
	annotations?: (keyof typeof AVAILABLE_ANNOTATIONS)[];
	blocks?: (keyof typeof AVAILABLE_BLOCKS)[];
	decorators?: (keyof typeof AVAILABLE_DECORATORS)[];
	innerBlocks?: (keyof typeof AVAILABLE_INNER_BLOCKS)[];
	lists?: (keyof typeof AVAILABLE_LISTS)[];
	styles?: (keyof typeof AVAILABLE_STYLES)[];
};

export const createPtBody = ({
	styles = [],
	blocks = [],
	innerBlocks = [],
	lists = [],
	decorators = [],
	annotations = [],
}: PtBodyProps) => {
	return defineField({
		name: "ptBody",
		title: "Rich text",
		type: "array",
		of: [
			defineArrayMember({
				type: "block",
				lists: lists.map((list) => AVAILABLE_LISTS[list]),
				marks: {
					annotations: annotations.map(
						(annotation) => AVAILABLE_ANNOTATIONS[annotation],
					),
					decorators: decorators.map(
						(decorator) => AVAILABLE_DECORATORS[decorator],
					),
				},
				styles: [
					...styles.map((style) => ({
						title:
							AVAILABLE_STYLES[style as keyof typeof AVAILABLE_STYLES] || style,
						value: style,
					})),
				],
				of: [
					// Uncomment when we have inner blocks
					// ...innerBlocks.map((block) =>
					//   defineArrayMember({...AVAILABLE_INNER_BLOCKS[block]}),
					// ),
				],
			}),
			...blocks.map((block) => defineArrayMember({...AVAILABLE_BLOCKS[block]})),
		],
	});
};
