import {definePathname} from "@tinloof/sanity-studio";
import {StickyNote} from "lucide-react";
import {defineType} from "sanity";

export default defineType({
	type: "document",
	name: "page",
	fields: [
		{
			type: "string",
			name: "title",
		},
		{
			type: "image",
			name: "image",
		},
		definePathname({name: "pathname"}),
	],
	preview: {
		select: {
			title: "title",
			image: "image",
		},
		prepare({title, image}) {
			return {
				title,
				media: image,
			};
		},
	},
});
