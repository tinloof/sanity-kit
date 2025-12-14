import {toPlainText} from "@portabletext/react";
import type {PortableTextBlock} from "@portabletext/types";

import {truncate} from "../strings";
import {slugify} from "../urls";

/**
 * Generates a unique ID for a portable text block based on its content
 *
 * Converts the block's plain text to a URL-friendly slug and truncates it to 200 characters.
 * Used internally by the RichText component for generating heading IDs.
 *
 * @param blocks - A portable text block
 * @returns A slugified and truncated ID string
 *
 * @example
 * ```ts
 * const block = {
 *   _type: "block",
 *   style: "h2",
 *   children: [{ text: "Getting Started with Sanity" }]
 * };
 *
 * getPtComponentId(block);
 * // Returns: "getting-started-with-sanity"
 * ```
 */
export const getPtComponentId = (blocks: PortableTextBlock) => {
	return truncate(slugify(toPlainText(blocks)), 200);
};

/**
 * Extract all custom block types from a PortableText array, excluding standard block types
 *
 * This utility type helps you get autocomplete for all custom block types in your
 * portable text configuration. Standard "block" types are automatically excluded.
 *
 * @example
 * ```ts
 * import type { BLOG_POST_QUERYResult } from "@/sanity/types";
 * import type { ExtractPtBlockType } from "@tinloof/sanity-web/utils";
 *
 * type PTBody = NonNullable<BLOG_POST_QUERYResult>["ptBody"];
 * type CustomBlockType = ExtractPtBlockType<PTBody>;
 * // Result: "imagePtBlock" | "code" | "table"
 * ```
 */
export type ExtractPtBlockType<
	TPortableText extends readonly {_type: string}[],
> = Exclude<NonNullable<TPortableText[number]>["_type"], "block">;

/**
 * Utility type to extract a specific block type from a PortableText array
 *
 * This type helper extracts the full type definition for a specific custom block type,
 * giving you full type safety when building components for portable text blocks.
 * Standard "block" type is automatically excluded from autocomplete.
 *
 * @example
 * ```ts
 * import type { BLOG_POST_QUERYResult } from "@/sanity/types";
 * import type { ExtractPtBlock } from "@tinloof/sanity-web/utils";
 *
 * type PTBody = NonNullable<BLOG_POST_QUERYResult>["ptBody"];
 *
 * // Extract the image block type
 * type ImageBlock = ExtractPtBlock<PTBody, "imagePtBlock">;
 *
 * // Use it in a component
 * function ImageComponent(props: ImageBlock) {
 *   return (
 *     <figure>
 *       <img src={props.asset?._ref} alt={props.alt || ""} />
 *       {props.caption && <figcaption>{props.caption}</figcaption>}
 *     </figure>
 *   );
 * }
 * ```
 */
export type ExtractPtBlock<
	TPortableText extends readonly {_type: string}[],
	TType extends
		ExtractPtBlockType<TPortableText> = ExtractPtBlockType<TPortableText>,
> = Extract<
	NonNullable<TPortableText[0]>,
	{
		_type: TType;
	}
>;
