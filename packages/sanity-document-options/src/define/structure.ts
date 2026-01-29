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

	// Collect schemas by group for later use
	const schemasByGroup = documentSchemas.reduce(
		(groups, schema) => {
			const group = schema.options?.structureGroup;
			if (group) {
				if (!groups[group]) {
					groups[group] = [];
				}
				groups[group].push(schema);
			}
			return groups;
		},
		{} as Record<string, DocumentDefinition[]>,
	);

	// Build structure items preserving the natural order
	const structureItems: NonNullable<ReturnType<typeof createSchemaItem>>[] = [];
	const seenGroups = new Set<string>();

	for (const schema of documentSchemas) {
		const group = schema.options?.structureGroup;

		if (!group) {
			// Ungrouped item - add directly at its natural position
			const item = createSchemaItem(schema);
			if (item) {
				structureItems.push(item);
			}
		} else if (!seenGroups.has(group)) {
			// First occurrence of this group - create the group with all its items
			seenGroups.add(group);

			const groupSchemas = schemasByGroup[group];
			const schemaItems = groupSchemas
				.map(createSchemaItem)
				.filter((item): item is NonNullable<typeof item> => Boolean(item));

			if (schemaItems.length > 0) {
				const groupTitle = group.charAt(0).toUpperCase() + group.slice(1);
				structureItems.push(
					S.listItem()
						.title(groupTitle)
						.child(S.list().title(groupTitle).items(schemaItems)),
				);
			}
		}
		// If group already seen, skip (already added with the group)
	}

	return () => S.list().title(toolTitle).items(structureItems);
}
