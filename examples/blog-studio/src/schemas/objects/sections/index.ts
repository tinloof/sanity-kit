import image from "./image";
import mediaImage from "./media-image";
import mediaVideo from "./media-video";
import text from "./text";

export default [text, image, mediaImage, mediaVideo].map((section) => ({
	...section,
	preview: {
		select: {
			...(section.preview?.select || {}),
		},
		// biome-ignore lint/suspicious/noExplicitAny: Dynamic section preview
		prepare: (selection: any) => {
			const basePreview = section?.preview?.prepare?.(selection) || {
				title: selection.title,
			};

			return {
				...basePreview,
				subtitle: section.title,
			};
		},
	},
}));
