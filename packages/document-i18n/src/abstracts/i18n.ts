import type {AbstractDefinition} from "@tinloof/sanity-extends";

export default {
	name: "i18n",
	type: "abstract",
	fields: [{name: "locale", type: "string", hidden: true}],
	options: {
		localized: true,
	},
} as AbstractDefinition;
