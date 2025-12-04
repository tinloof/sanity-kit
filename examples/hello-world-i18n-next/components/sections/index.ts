import type { PAGE_QUERYResult } from "@examples/hello-world-i18n-studio/types";
import {
	type SectionProps as BaseSectionProps,
	createSectionsRenderer,
} from "@tinloof/sanity-web/components/sections-renderer";
import ImageSection from "./image";
import TextSection from "./text";

type SharedProps = {
	locale: string;
};

type Sections = NonNullable<NonNullable<PAGE_QUERYResult>["sections"]>;

export type SectionProps<TType extends Sections[number]["_type"]> =
	BaseSectionProps<Sections, TType, SharedProps>;

export const SectionsRenderer = createSectionsRenderer<Sections, SharedProps>({
	components: {
		"section.image": ImageSection,
		"section.text": TextSection,
	},
});
