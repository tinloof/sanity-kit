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
			title: "video.title",
			thumbnailUrl: "video.asset.thumbnail.url",
			description: "video.description",
		},
		prepare(selection) {
			const {title, thumbnailUrl, description} = selection;

			return {
				title: title || "Media Video",
				subtitle: description || "External storage video",
				imageUrl: thumbnailUrl,
			};
		},
	},
});
