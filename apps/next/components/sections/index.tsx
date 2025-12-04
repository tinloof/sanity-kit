import { createSections } from "@tinloof/sanity-web/components/sections-renderer";

import HeroSection from "./hero";

export default createSections({
	components: {
		"section.hero": HeroSection,
	},
});
