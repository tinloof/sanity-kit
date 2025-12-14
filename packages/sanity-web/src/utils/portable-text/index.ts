import {toPlainText} from "@portabletext/react";
import type {PortableTextBlock} from "@portabletext/types";

import {truncate} from "../strings";
import {slugify} from "../urls";

export const getPtComponentId = (blocks: PortableTextBlock) => {
	return truncate(slugify(toPlainText(blocks)), 200);
};

/**
 * Extract all custom block types from a PortableText array, excluding standard block types
 * @example
 * type CustomBlockType = ExtractPtBlockType<PTBody> // "imagePtBlock" | "code" | "table"
 */
export type ExtractPtBlockType<
	TPortableText extends readonly {_type: string}[],
> = Exclude<NonNullable<TPortableText[number]>["_type"], "block">;

/**
 * Utility type to extract a specific block type from a PortableText array
 * Automatically excludes standard "block" type from autocomplete
 * @example
 * type ImageBlockProps = ExtractPtBlock<PTBody, "imagePtBlock">
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
