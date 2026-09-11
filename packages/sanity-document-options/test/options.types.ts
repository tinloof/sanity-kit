import {type DocumentOptions, defineType} from "sanity";
import type {
	ListItemBuilder,
	StructureBuilder,
	StructureResolverContext,
} from "sanity/structure";
import {documentOptions, type InlineStructureProps} from "../src";

defineType({
	name: "article",
	type: "document",
	fields: [],
	options: {structureOptions: false},
});
defineType({name: "post", type: "document", fields: []});
defineType({
	name: "category",
	type: "document",
	fields: [],
	options: {structureOptions: {title: "Category", orderable: true}},
});
defineType({
	name: "home",
	type: "document",
	fields: [],
	options: {structureOptions: {singleton: {id: "site-home"}}},
});
defineType({
	name: "framework",
	type: "document",
	fields: [],
	options: {
		structureOptions: (S, context) => {
			const builder: StructureBuilder = S;
			const resolverContext: StructureResolverContext = context;
			const result: ListItemBuilder = builder
				.listItem()
				.title(resolverContext.dataset);
			return result;
		},
	},
});

const invalidTrue: DocumentOptions = {
	// @ts-expect-error Only false disables an entry; true is not a built-in option.
	structureOptions: true,
};
const invalidCallback: DocumentOptions = {
	// @ts-expect-error Callbacks still return a ListItemBuilder.
	structureOptions: () => false,
};
const invalidKeepPanes: InlineStructureProps = {
	// @ts-expect-error keepPanesOnCreate accepts only booleans.
	keepPanesOnCreate: "true",
};

documentOptions({});
documentOptions({structure: {}});
documentOptions({structure: false});
documentOptions({structure: {keepPanesOnCreate: true}});
documentOptions({structure: {keepPanesOnCreate: false}});
documentOptions({structure: {keepPanesOnCreate: undefined}});
