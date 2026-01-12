import {defineField, defineType} from "sanity";

export default defineType({
	name: "section.mediaImage",
	type: "object",
	title: "Media Image (External)",
	description: "Image stored in external storage via @tinloof/sanity-media",
	fields: [
		defineField({
			name: "image",
			title: "Image",
			type: "media.image",
			description: "Uses external S3-compatible storage instead of Sanity CDN",
			validation: (Rule) => Rule.required(),
		}),
	],
	preview: {
		select: {
			alt: "image.alt",
			imageUrl: "image.asset.url",
			caption: "image.caption",
		},
		prepare(selection) {
			const {alt, imageUrl, caption} = selection;

			return {
				title: alt || "Media Image",
				subtitle: caption || "External storage image",
				imageUrl,
			};
		},
	},
});
