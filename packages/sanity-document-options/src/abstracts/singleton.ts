import {
	defineAbstractResolver,
	type AbstractDefinition,
} from "@tinloof/sanity-extends";
import type {
	DocumentActionComponent,
	NewDocumentOptionsContext,
	InitialValueTemplateItem,
} from "sanity";

export default defineAbstractResolver(
	(schema, options) =>
		({
			name: "singleton",
			type: "abstract",
			options: {
				document: {
					actions: (prev: DocumentActionComponent[]) =>
						prev.filter(
							(action: DocumentActionComponent) =>
								!["delete", "duplicate", "unpublish"].includes(
									action.action || "",
								),
						),
					newDocumentOptions: (
						prev: InitialValueTemplateItem[],
						context: NewDocumentOptionsContext,
					) => {
						const {creationContext} = context;

						if (
							["structure", "global", "document"].includes(creationContext.type)
						) {
							return prev.filter(
								(templateItem: InitialValueTemplateItem) =>
									templateItem.templateId !== schema.name,
							);
						}

						return prev;
					},
				},
				structureOptions: {
					singleton:
						typeof options === "object" &&
						"id" in options &&
						typeof options.id === "string"
							? {id: options.id}
							: true,
				},
				schema: {
					templates: [],
				},
			},
		}) as AbstractDefinition,
);
