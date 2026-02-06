import {FolderIcon} from "@sanity/icons";
import {orderableDocumentListDeskItem} from "@sanity/orderable-document-list";
import pluralize from "pluralize";
import type * as React from "react";
import type {DocumentDefinition} from "sanity";
import type {
	StructureBuilder,
	StructureResolver,
	StructureResolverContext,
} from "sanity/structure";

import {LOCALE_FIELD_NAME, TOOL_TITLE} from "../constants";
import {
	localizedItem,
	localizedOrderableItem,
	localizedSingletonItem,
	singletonItem,
} from "../structure-items";
import type {InlineStructureProps, StructureBuiltinOptions} from "../types";

/**
 * Generates structure from document schema options.
 * @internal
 */
export default function defineStructure(
	S: StructureBuilder,
	context: StructureResolverContext,
	options?: InlineStructureProps,
): StructureResolver | null {
	const {
		schema: {_original},
	} = context;
	const documentSchemas = _original?.types.filter(
		({type}) => type === "document",
	) as DocumentDefinition[];

	const {
		locales = [],
		hide = [],
		localeFieldName = LOCALE_FIELD_NAME,
		toolTitle = TOOL_TITLE,
	} = options || {};

	// If no documents are found, return the default structure
	if (!documentSchemas || !documentSchemas.length) {
		console.error("No documents found");
		return () => S.defaults();
	}

	// Always create structure - even if no explicit config is provided

	// Create title with capitalization
	function createTitle(schema: DocumentDefinition, shouldPluralize = false) {
		// Check for title in structureOptions (object form)
		const structureOptions = schema.options?.structureOptions;
		if (
			structureOptions &&
			typeof structureOptions === "object" &&
			structureOptions.title
		) {
			return shouldPluralize
				? pluralize(structureOptions.title)
				: structureOptions.title;
		}

		const title = schema.title || schema.name;
		const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);
		return shouldPluralize ? pluralize(capitalizedTitle) : capitalizedTitle;
	}

	// Create structure item for a schema
	function createSchemaItem(schema: DocumentDefinition) {
		// Skip hidden schemas
		if (hide.includes(schema.name)) {
			return null;
		}

		const structureOptions = schema.options?.structureOptions;

		// Handle custom builder function
		if (typeof structureOptions === "function") {
			return structureOptions(S, context);
		}

		// Handle built-in options or create default
		return createBuiltinStructureItem(schema, structureOptions);
	}

	// Create structure item using built-in options
	function createBuiltinStructureItem(
		schema: DocumentDefinition,
		opts?: StructureBuiltinOptions,
	) {
		const title = createTitle(schema);
		const icon = opts?.icon || schema.icon;

		// Handle orderable option
		if (opts && "orderable" in opts && opts?.orderable) {
			if (opts.singleton) {
				throw new Error(
					`Schema "${schema.name}" cannot be both singleton and orderable`,
				);
			}

			if (
				schema.options &&
				"localized" in schema.options &&
				schema.options?.localized
			) {
				// Localized orderable
				if (!locales || locales.length === 0) {
					throw new Error(
						`Schema "${schema.name}" is marked as localized orderable but no locales are provided`,
					);
				}

				return localizedOrderableItem({
					S,
					context,
					name: schema.name,
					title,
					locales,
					icon,
					localeFieldName,
				});
			}
			// Non-localized orderable
			const pluralizedTitle = createTitle(schema, true);
			return orderableDocumentListDeskItem({
				title: pluralizedTitle,
				icon: (icon as React.ComponentType) ?? FolderIcon,
				type: schema.name,
				S,
				context,
			});
		}

		if (opts?.singleton) {
			// Check if localized singleton
			if (
				schema.options &&
				"localized" in schema.options &&
				schema.options?.localized
			) {
				if (!locales || locales.length === 0) {
					throw new Error(
						`Schema "${schema.name}" is marked as localized singleton but no locales are provided`,
					);
				}

				return localizedSingletonItem({
					S,
					context,
					name: schema.name,
					title,
					locales,
					icon,
					id:
						typeof opts?.singleton === "object"
							? opts?.singleton?.id
							: undefined,
				});
			}

			return singletonItem({
				S,
				type: schema.name,
				title,
				id:
					typeof opts?.singleton === "object" ? opts?.singleton?.id : undefined,
			}).icon(icon);
		}

		// Handle localized non-singleton items
		if (
			schema.options &&
			"localized" in schema.options &&
			schema.options.localized
		) {
			if (!locales || locales.length === 0) {
				throw new Error(
					`Schema "${schema.name}" is marked as localized but no locales are provided`,
				);
			}

			return localizedItem({
				S,
				name: schema.name,
				title,
				locales,
				icon,
				localeFieldName,
			});
		}

		// Default: create document list item
		const pluralizedTitle = createTitle(schema, true);
		const documentItem = S.documentTypeListItem(schema.name).title(
			pluralizedTitle,
		);
		return icon ? documentItem.icon(icon) : documentItem;
	}

	// Entry type for tracking order at each level
	type NodeEntry =
		| {type: "schema"; schema: DocumentDefinition}
		| {type: "group"; name: string};

	// Tree node type for building nested folder structure
	type GroupTreeNode = {
		entries: NodeEntry[]; // Ordered list of schemas and child groups
		children: Map<string, GroupTreeNode>;
		seenChildGroups: Set<string>; // Track which child groups have been added to entries
	};

	// Create a new tree node
	function createTreeNode(): GroupTreeNode {
		return {entries: [], children: new Map(), seenChildGroups: new Set()};
	}

	// Build a tree structure from schema paths
	const groupTree = createTreeNode();

	for (const schema of documentSchemas) {
		const structureGroup = schema.options?.structureGroup;

		// Normalize to array and filter out empty segments
		const path = structureGroup
			? (Array.isArray(structureGroup) ? structureGroup : [structureGroup]).filter(
					(segment) => segment.length > 0,
				)
			: [];

		if (path.length === 0) {
			// Ungrouped (or empty array) - add to root entries directly
			groupTree.entries.push({type: "schema", schema});
		} else {
			// Navigate/create the path in the tree, tracking order at each level
			let currentNode = groupTree;
			for (let i = 0; i < path.length; i++) {
				const segment = path[i];
				const isLastSegment = i === path.length - 1;

				// Track first occurrence of this child group at current level
				if (!currentNode.seenChildGroups.has(segment)) {
					currentNode.seenChildGroups.add(segment);
					currentNode.entries.push({type: "group", name: segment});
				}

				// Create child node if it doesn't exist
				if (!currentNode.children.has(segment)) {
					currentNode.children.set(segment, createTreeNode());
				}

				currentNode = currentNode.children.get(segment)!;

				// Add schema to the final node
				if (isLastSegment) {
					currentNode.entries.push({type: "schema", schema});
				}
			}
		}
	}

	// Recursively build structure from tree node, preserving entry order
	function buildStructureFromNode(
		node: GroupTreeNode,
	): NonNullable<ReturnType<typeof createSchemaItem>>[] {
		const items: NonNullable<ReturnType<typeof createSchemaItem>>[] = [];

		for (const entry of node.entries) {
			if (entry.type === "schema") {
				const item = createSchemaItem(entry.schema);
				if (item) {
					items.push(item);
				}
			} else {
				// Child group
				const childNode = node.children.get(entry.name);
				if (childNode) {
					const childItems = buildStructureFromNode(childNode);
					if (childItems.length > 0) {
						const groupTitle =
							entry.name.charAt(0).toUpperCase() + entry.name.slice(1);
						items.push(
							S.listItem()
								.title(groupTitle)
								.child(S.list().title(groupTitle).items(childItems)),
						);
					}
				}
			}
		}

		return items;
	}

	// Build structure items from root node
	const structureItems = buildStructureFromNode(groupTree);

	return () => S.list().title(toolTitle).items(structureItems);
}
