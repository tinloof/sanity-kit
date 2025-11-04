import {createSectionsRenderer} from "@tinloof/sanity-web/components/sections-renderer";

import HeroSection from "./hero";

export default createSectionsRenderer({
  sectionComponentMap: {
    "section.hero": HeroSection,
  },
});
