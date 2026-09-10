import {
	type AbstractDefinition,
	defineAbstractResolver,
} from "@tinloof/sanity-extends";
import type {
	DocumentActionComponent,
	NewDocumentOptionsContext,
	TemplateItem,
} from "sanity";

/** @public */
const singletonAbstract = defineAbstractResolver(
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
						prev: TemplateItem[],
						context: NewDocumentOptionsContext,
					) => {
						const {creationContext} = context;

						if (
							["structure", "global", "document"].includes(creationContext.type)
						) {
							return prev.filter(
								(templateItem: TemplateItem) =>
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

export default singletonAbstract;
