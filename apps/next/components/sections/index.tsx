import { createSectionsComponent } from "@tinloof/sanity-web/components/sections-renderer";

import HeroSection from "./hero";

export default createSectionsComponent({
	components: {
		"section.hero": HeroSection,
	},
});
