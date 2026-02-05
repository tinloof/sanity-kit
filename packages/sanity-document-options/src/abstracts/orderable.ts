import {
	orderRankField,
	orderRankOrdering,
} from "@sanity/orderable-document-list";
import {
	defineAbstractResolver,
	type AbstractDefinition,
} from "@tinloof/sanity-extends";

export default defineAbstractResolver(
	({name: type}) =>
		({
			name: "orderable",
			type: "abstract",
			options: {
				structureOptions: {
					orderable: true,
				},
			},
			orderings: [orderRankOrdering],
			fields: [orderRankField({type})],
		}) as AbstractDefinition,
);
