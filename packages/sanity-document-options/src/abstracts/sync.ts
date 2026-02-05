import type {AbstractDefinition} from "@tinloof/sanity-extends";
import {isDev} from "sanity";
import type {
	DocumentActionComponent,
	NewDocumentOptionsContext,
	TemplateItem,
} from "sanity";

export default {
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
