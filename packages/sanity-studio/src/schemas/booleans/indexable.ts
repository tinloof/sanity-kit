import { defineField } from "sanity";

export default defineField({
	description:
		"Won't show up in search engines if set to false, but accessible through URL.",
	initialValue: true,
	name: "indexable",
	type: "boolean",
});
