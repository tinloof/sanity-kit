import { Header } from "./Header";
import { Hero } from "./Hero";
import Logos from "./Logos";
import Testimonials from "./Testimonials";

export const sections = {
	"section.header": Header,
	"section.hero": Hero,
	"section.logos": Logos,
	"section.testimonials": Testimonials,
};

export function SectionRenderer(props: { section: any }) {
	const Section = sections[props.section._type];

	if (!Section) {
		return null;
	}

	return <Section {...props.section} />;
}
