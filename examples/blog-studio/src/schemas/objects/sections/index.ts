import type {ObjectDefinition} from "sanity";
import image from "./image";
import mediaImage from "./media-image";
import mediaVideo from "./media-video";
import text from "./text";

const sections: ObjectDefinition[] = [text, image, mediaImage, mediaVideo];

export default sections.map((section) => ({
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
