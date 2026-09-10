import type {ObjectDefinition} from "sanity";
import image from "./image";
import text from "./text";

const sections: ObjectDefinition[] = [text, image];

export default sections.map((section) => ({
	...section,
	preview: {
		select: {
			...(section.preview?.select || {}),
		},
		prepare: (selection: Record<"title", any>) => {
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
