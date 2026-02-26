import {defineField, defineType} from "sanity";

export default defineType({
	name: "section.mediaVideo",
	type: "object",
	title: "Media Video (External)",
	description: "Video stored in external storage via @tinloof/sanity-media",
	fields: [
		defineField({
			name: "video",
			title: "Video",
			type: "media.video",
			description: "Uses external S3-compatible storage instead of Sanity CDN",
			validation: (Rule) => Rule.required(),
		}),
	],
	preview: {
		select: {
			title: "video.asset.title",
			thumbnailUrl: "video.asset.thumbnail.url",
		},
		prepare(selection) {
			const {title, thumbnailUrl} = selection;

			return {
				title: title || "Media Video",
				imageUrl: thumbnailUrl,
			};
		},
	},
});
