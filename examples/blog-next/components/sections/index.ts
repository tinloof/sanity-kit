import type {PAGE_QUERY_RESULT} from "@examples/blog-studio/types";
import {createSectionsComponent} from "@tinloof/sanity-web/components/sections-renderer";
import ImageSection from "./image";
import TextSection from "./text";

const Sections = createSectionsComponent<
	NonNullable<NonNullable<PAGE_QUERY_RESULT>["sections"]>
>({
	components: {
		"section.image": ImageSection,
		"section.text": TextSection,
	},
});

type SectionProps = (typeof Sections)["_SectionProps"];

export {type SectionProps, Sections};
