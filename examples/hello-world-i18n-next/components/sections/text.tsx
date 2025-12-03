import {SectionProps} from ".";

export default function TextSection(props: SectionProps<"section.text">) {
  const {text} = props;

  return (
    <section className="w-full h-100 flex flex-col items-center justify-center">
      <p>{text}</p>
    </section>
  );
}
