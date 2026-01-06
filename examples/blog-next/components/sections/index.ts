import type {PAGE_QUERYResult} from "@examples/blog-studio/types";
import {createSectionsComponent} from "@tinloof/sanity-web/components/sections-renderer";
import ImageSection from "./image";
import TextSection from "./text";

const Sections = createSectionsComponent<
	NonNullable<NonNullable<PAGE_QUERYResult>["sections"]>
>({
	components: {
		"section.image": ImageSection,
		"section.text": TextSection,
	},
});

type SectionProps = (typeof Sections)["_SectionProps"];

export {Sections, type SectionProps};
