import type {AbstractDefinition} from "@tinloof/sanity-extends";
import type {
	DocumentActionComponent,
	NewDocumentOptionsContext,
	TemplateItem,
} from "sanity";
import {isDev} from "sanity";

/** @public */
const syncAbstract = {
	name: "sync",
	type: "abstract",
	options: {
		document: {
			actions: (prev: DocumentActionComponent[]) => {
				return isDev
					? prev
					: prev.filter(
							(action: DocumentActionComponent) =>
								!["delete", "duplicate"].includes(action.action || ""),
						);
			},
			newDocumentOptions: (
				prev: TemplateItem[],
				context: NewDocumentOptionsContext,
			) => {
				const {creationContext} = context;

				if (
					!isDev &&
					["structure", "global", "document"].includes(creationContext.type)
				) {
					return prev.filter(
						(templateItem: TemplateItem) =>
							templateItem.templateId !== context.schemaType,
					);
				}

				return prev;
			},
		},
	},
} as AbstractDefinition;

export default syncAbstract;
