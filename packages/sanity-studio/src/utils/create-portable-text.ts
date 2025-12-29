import type {
	BlockDefinition,
	BlockMarksDefinition,
	FieldDefinition,
} from "sanity";
import {defineArrayMember, defineField} from "sanity";

export type BlockDefinitionType<T extends keyof BlockDefinition> =
	NonNullable<BlockDefinition[T]> extends Array<infer U> ? U : never;

export type BlockMarkType<T extends keyof BlockMarksDefinition> =
	NonNullable<BlockMarksDefinition[T]> extends Array<infer U> ? U : never;

export const defaultPTStyles: Record<string, BlockDefinitionType<"styles">> = {
	normal: {title: "Normal", value: "normal"},
	h1: {title: "H1", value: "h1"},
	h2: {title: "H2", value: "h2"},
	h3: {title: "H3", value: "h3"},
	h4: {title: "H4", value: "h4"},
	h5: {title: "H5", value: "h5"},
	h6: {title: "H6", value: "h6"},
	blockquote: {title: "Blockquote", value: "blockquote"},
} as const;

export const defaultPTLists: Record<string, BlockDefinitionType<"lists">> = {
	bullet: {title: "Bullet list", value: "bullet"},
	number: {title: "Numbered list", value: "number"},
} as const;

export const defaultPTDecorators = {
	strong: {title: "Strong", value: "strong"},
	em: {title: "Emphasis", value: "em"},
	underline: {title: "Underline", value: "underline"},
	strikeThrough: {title: "Strike through", value: "strike-through"},
	code: {title: "Code", value: "code"},
} as const;

export type PortableTextRegistry = {
	/**
	 * Available text styles (e.g., normal, h1, h2, blockquote)
	 * Can be a record or a function that receives defaults and returns a record
	 */
	styles?: Record<string, BlockDefinitionType<"styles">>;
	/**
	 * Available block-level elements (e.g., image, code, video)
	 */
	blocks?: Record<string, BlockDefinitionType<"of">>;
	/**
	 * Available inline blocks (e.g., references, special inline elements)
	 */
	innerBlocks?: Record<string, FieldDefinition>;
	/**
	 * Available list types (e.g., bullet, number)
	 * Can be a record or a function that receives defaults and returns a record
	 */
	lists?: Record<string, BlockDefinitionType<"lists">>;
	/**
	 * Available text decorators (e.g., strong, em, underline)
	 * Can be a record or a function that receives defaults and returns a record
	 */
	decorators?: Record<string, BlockMarkType<"decorators">>;
	/**
	 * Available annotations (e.g., link, highlight)
	 */
	annotations?: Record<string, BlockMarkType<"annotations">>;
};

/**
 * Options for selecting items from the registry
 */
export type PortableTextFieldOptions<T extends PortableTextRegistry> = {
	/**
	 * Array of style keys to include
	 */
	styles?: Array<keyof T["styles"]>;
	/**
	 * Array of block keys to include
	 */
	blocks?: Array<keyof T["blocks"]>;
	/**
	 * Array of inner block keys to include
	 */
	innerBlocks?: Array<keyof T["innerBlocks"]>;
	/**
	 * Array of list keys to include
	 */
	lists?: Array<keyof T["lists"]>;
	/**
	 * Array of decorator keys to include
	 */
	decorators?: Array<keyof T["decorators"]>;
	/**
	 * Array of annotation keys to include
	 */
	annotations?: Array<keyof T["annotations"]>;
};

/**
 * Creates a portable text field factory function with a predefined registry
 *
 * This is a factory function that helps you create project-specific portable text helpers.
 * Instead of defining blocks, annotations, and styles for every field, you define them once
 * in a registry and then reference them by key.
 *
 * @param registry - Object containing all available styles, blocks, decorators, lists, annotations, and inner blocks
 * @returns A function that creates portable text fields using keys from the registry
 *
 * @example
 * ```ts
 * // 1. Create your registry in helpers/create-pt-body.ts
 * import {definePortableTextFactory} from "@tinloof/sanity-studio/utils";
 * import {defineField} from "sanity";
 *
 * export const createPtBody = definePortableTextFactory({
 *   styles: {
 *     normal: {title: "Normal", value: "normal"},
 *     h1: {title: "Heading 1", value: "h1"},
 *     h2: {title: "Heading 2", value: "h2"},
 *     blockquote: {title: "Quote", value: "blockquote"},
 *   },
 *   decorators: {
 *     strong: {title: "Strong", value: "strong"},
 *     em: {title: "Emphasis", value: "em"},
 *     code: {title: "Code", value: "code"},
 *   },
 *   lists: {
 *     bullet: {title: "Bullet", value: "bullet"},
 *     number: {title: "Numbered", value: "number"},
 *   },
 *   blocks: {
 *     image: defineField({
 *       type: "image",
 *       name: "image",
 *       fields: [
 *         defineField({name: "alt", type: "string"}),
 *         defineField({name: "caption", type: "string"}),
 *       ],
 *     }),
 *     code: defineField({
 *       type: "code",
 *       name: "code",
 *     }),
 *   },
 *   annotations: {
 *     link: defineField({
 *       name: "link",
 *       type: "object",
 *       fields: [
 *         defineField({
 *           name: "href",
 *           type: "url",
 *           validation: (Rule) => Rule.required(),
 *         }),
 *       ],
 *     }),
 *   },
 * });
 *
 * // 2. Use it in your schemas
 * export default defineType({
 *   name: "post",
 *   type: "document",
 *   fields: [
 *     defineField({
 *       ...createPtBody({
 *         styles: ["normal", "h2", "h3"],
 *         decorators: ["strong", "em"],
 *         lists: ["bullet"],
 *         blocks: ["image", "code"],
 *         annotations: ["link"],
 *       }),
 *       validation: (Rule) => Rule.required(),
 *     }),
 *   ],
 * });
 * ```
 */
export const definePortableTextFactory = <T extends PortableTextRegistry>(
	registry: T,
) => {
	return ({
		styles = [],
		blocks = [],
		innerBlocks = [],
		lists = [],
		decorators = [],
		annotations = [],
	}: PortableTextFieldOptions<T>): FieldDefinition => {
		return defineField({
			name: "body",
			title: "Body",
			type: "array",
			of: [
				defineArrayMember({
					type: "block",
					lists: lists
						.map((key) => registry.lists?.[key as string])
						.filter((item): item is {title: string; value: string} =>
							Boolean(item),
						),
					marks: {
						annotations: annotations
							.map((key) => registry.annotations?.[key as string])
							.filter((item): item is FieldDefinition => Boolean(item)),
						decorators: decorators
							.map((key) => registry.decorators?.[key as string])
							.filter((item): item is {title: string; value: string} =>
								Boolean(item),
							),
					},
					styles: styles
						.map((key) => registry.styles?.[key as string])
						.filter((item): item is {title: string; value: string} =>
							Boolean(item),
						),
					of: innerBlocks
						.map((key) => {
							const block = registry.innerBlocks?.[key as string];
							return block ? defineArrayMember(block) : undefined;
						})
						.filter((item): item is ReturnType<typeof defineArrayMember> =>
							Boolean(item),
						),
				}),
				...blocks
					.map((key) => {
						const block = registry.blocks?.[key as string];
						return block ? defineArrayMember(block) : undefined;
					})
					.filter((item): item is ReturnType<typeof defineArrayMember> =>
						Boolean(item),
					),
			],
		});
	};
};
