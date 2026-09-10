import {
	orderRankField,
	orderRankOrdering,
} from "@sanity/orderable-document-list";
import {
	type AbstractDefinition,
	defineAbstractResolver,
} from "@tinloof/sanity-extends";

/** @public */
const orderableAbstract = defineAbstractResolver(
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

export default orderableAbstract;
