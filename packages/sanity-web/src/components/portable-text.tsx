import type {
	PortableTextBlockComponent,
	PortableTextComponents,
	PortableTextListComponent,
	PortableTextListItemComponent,
	PortableTextMarkComponent,
	PortableTextProps,
	PortableTextTypeComponent,
} from "@portabletext/react";
import {
	PortableText as BasePortableText,
	toPlainText,
} from "@portabletext/react";
import type {PortableTextBlock} from "@portabletext/types";
import React, {cloneElement, isValidElement} from "react";
import getSlug from "speakingurl";

type NonUndefined<T> = T extends undefined ? never : T;

/**
 * Single item in the PortableText array
 */
type PTItem<T> = T extends ReadonlyArray<infer Item> ? Item : never;

/**
 * Only the standard "block" items
 */
type PTBlock<T> =
	PTItem<T> extends infer Item
		? Item extends {_type: "block"}
			? Item
			: never
		: never;

/**
 * Only the custom (non-"block") items
 */
type PTCustomBlock<T> =
	PTItem<T> extends infer Item
		? Item extends {_type: infer Type}
			? Type extends "block"
				? never
				: Item
			: never
		: never;

/**
 * Extract block styles from a Sanity PortableText array
 */
type ExtractBlockStyles<T> = NonUndefined<PTBlock<T>["style"]>;

/**
 * Extract list item types from a Sanity PortableText array
 */
type ExtractListItemTypes<T> = NonUndefined<PTBlock<T>["listItem"]>;

/**
 * Extract mark definition types and their shapes
 */
type ExtractMarkDefs<T> =
	PTBlock<T>["markDefs"] extends ReadonlyArray<infer MarkDef> ? MarkDef : never;

/**
 * Extract just the _type from mark definitions for use as keys
 */
type ExtractMarkDefTypes<T> =
	ExtractMarkDefs<T> extends {_type: infer Type} ? Type : never;

/**
 * Get the shape of a specific mark def by type
 */
type GetMarkDefByType<T, K> =
	ExtractMarkDefs<T> extends infer MD
		? MD extends {_type: K}
			? MD
			: never
		: never;

/**
 * Extract custom block types (non-block items)
 */
type ExtractCustomBlocks<T> = PTCustomBlock<T>;

/**
 * Extract custom block type names
 */
type ExtractCustomTypes<T> =
	ExtractCustomBlocks<T> extends {_type: infer Type} ? Type : never;

/**
 * Get the shape of a specific custom block by type
 */
type GetCustomBlockByType<T, K> =
	ExtractCustomBlocks<T> extends infer Block
		? Block extends {_type: K}
			? Block
			: never
		: never;

/**
 * Type-safe PortableText components derived from Sanity typegen
 */
export type TypedPortableTextComponents<T> = {
	block?: {
		[K in ExtractBlockStyles<T> as K extends string
			? K
			: never]?: PortableTextBlockComponent;
	};
	list?: {
		[K in ExtractListItemTypes<T> as K extends string
			? K
			: never]?: PortableTextListComponent;
	};
	listItem?: {
		[K in ExtractListItemTypes<T> as K extends string
			? K
			: never]?: PortableTextListItemComponent;
	};
	marks?: {
		[K in ExtractMarkDefTypes<T> as K extends string
			? K
			: never]?: PortableTextMarkComponent<GetMarkDefByType<T, K>>;
	} & {
		// Also allow string marks like 'strong', 'em', etc.
		[key: string]: PortableTextMarkComponent<any> | undefined;
	};
	types?: {
		[K in ExtractCustomTypes<T> as K extends string
			? K
			: never]?: PortableTextTypeComponent<GetCustomBlockByType<T, K>>;
	};
	unknownType?: PortableTextComponents["unknownType"];
	unknownMark?: PortableTextComponents["unknownMark"];
	unknownList?: PortableTextComponents["unknownList"];
	unknownListItem?: PortableTextComponents["unknownListItem"];
	unknownBlockStyle?: PortableTextComponents["unknownBlockStyle"];
	hardBreak?: PortableTextComponents["hardBreak"];
};

export type PortableTextComponentProps<T extends ReadonlyArray<any>> = Omit<
	PortableTextProps,
	"components" | "value"
> & {
	value: T;
	components?: TypedPortableTextComponents<T>;
};

/**
 * Creates a linkable heading component with automatic slug generation
 */
const createLinkableHeading = (
	Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6",
	userComponent?: PortableTextBlockComponent,
): PortableTextBlockComponent => {
	if (!userComponent) {
		return (props) => {
			const slug = getSlug(toPlainText(props.value));
			return <Tag id={slug}>{props.children}</Tag>;
		};
	}

	return (props) => {
		const slug = getSlug(toPlainText(props.value));

		// Handle function components
		if (typeof userComponent === "function") {
			const UserElement = (userComponent as any)(props);
			if (!UserElement) return null;

			// Clone the element and inject the id prop
			if (isValidElement(UserElement)) {
				return cloneElement(UserElement, {id: slug} as any);
			}

			return UserElement;
		}

		return <Tag id={slug}>{props.children}</Tag>;
	};
};

/**
 * Merges user components with default heading components that have slug generation
 */
const mergeComponentsWithSlugs = <T extends ReadonlyArray<any>>(
	userComponents?: TypedPortableTextComponents<T>,
): PortableTextComponents => {
	const blockComponents: PortableTextComponents["block"] = {
		h1: createLinkableHeading("h1", (userComponents?.block as any)?.h1),
		h2: createLinkableHeading("h2", (userComponents?.block as any)?.h2),
		h3: createLinkableHeading("h3", (userComponents?.block as any)?.h3),
		h4: createLinkableHeading("h4", (userComponents?.block as any)?.h4),
		h5: createLinkableHeading("h5", (userComponents?.block as any)?.h5),
		h6: createLinkableHeading("h6", (userComponents?.block as any)?.h6),
	};

	return {
		...userComponents,
		block: {
			...userComponents?.block,
			...blockComponents,
		},
	} as PortableTextComponents;
};

/**
 * Type-safe PortableText component for rendering Sanity Portable Text
 *
 * @example
 * ```tsx
 * import { PortableText } from '@tinloof/sanity-web/components/portable-text';
 * import type { BLOG_POST_QUERYResult } from './sanity.types';
 *
 * type PTBody = NonNullable<BLOG_POST_QUERYResult>['ptBody'];
 *
 * function BlogPost({ data }: { data: BLOG_POST_QUERYResult }) {
 *   return (
 *     <PortableText<PTBody>
 *       value={data.ptBody}
 *       components={{
 *         block: {
 *           h2: ({ children }) => <h2>{children}</h2>,
 *         },
 *         marks: {
 *           link: ({ children, value }) => <a href={value?.url}>{children}</a>,
 *         },
 *         types: {
 *           imagePtBlock: ({ value }) => <img src={value.asset?._ref} />,
 *         },
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export function PortableText<T extends ReadonlyArray<any>>({
	value,
	components,
	...props
}: PortableTextComponentProps<T>) {
	if (!value || value.length === 0) {
		return null;
	}

	const mergedComponents = mergeComponentsWithSlugs(components);

	return (
		<BasePortableText
			value={value as unknown as PortableTextBlock | PortableTextBlock[]}
			components={mergedComponents}
			{...props}
		/>
	);
}
