import {SanityImage} from "@/data/sanity/client";
import {SectionProps} from ".";

export default function ImageSection(props: SectionProps<"section.image">) {
  const {image} = props;

  return (
    <section className="w-full h-100 flex flex-col items-center justify-center">
      {image ? <SanityImage data={image} /> : null}
    </section>
  );
}
