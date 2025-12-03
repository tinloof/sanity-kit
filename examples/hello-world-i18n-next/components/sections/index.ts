import {PAGE_QUERYResult} from "@examples/hello-world-i18n-studio/types";
import ImageSection from "./image";
import TextSection from "./text";
import {createSectionsRenderer} from "@tinloof/sanity-web/components";

type Sections = NonNullable<NonNullable<PAGE_QUERYResult>["sections"]>;

type SectionsTypes = Sections[0]["_type"];

export type SectionProps<T extends SectionsTypes> = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>["sections"]>[number],
  {_type: T}
> & {
  _sectionIndex: number;
};

const sectionsList: {
  [K in SectionsTypes]: React.ComponentType<SectionProps<K>>;
} = {
  "section.image": ImageSection,
  "section.text": TextSection,
};

export const SectionsRenderer = createSectionsRenderer({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sectionComponentMap: sectionsList as Record<string, any>, // ComponentsMap
  // Shared Props
});
