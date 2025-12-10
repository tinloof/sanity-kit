import {defineAbstractResolver} from "@tinloof/sanity-extends";

export default defineAbstractResolver((_, options) => ({
	name: "singleton",
	type: "abstract",
	options: {
		document: {
			actions: (prev) =>
				prev.filter(
					(action) =>
						!["delete", "duplicate", "unpublish"].includes(action.action || ""),
				),
			newDocumentOptions: (prev, context) => {
				const {creationContext} = context;

				if (
					["structure", "global", "document"].includes(creationContext.type)
				) {
					return prev.filter(
						(templateItem) => templateItem.templateId !== context.schemaType,
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
}));
