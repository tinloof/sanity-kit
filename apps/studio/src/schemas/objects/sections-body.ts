import {defineType} from "sanity";
import sections from "../sections";

// Differs from ptBody in that it specializes in adding & reordering sections.
export default defineType({
  name: "sectionsBody",
  title: "Sections content",
  type: "array",
  of: [
    ...sections.map((section) => ({
      type: section.name,
    })),
  ],
  options: {
    insertMenu: {
      views: [
        {
          name: "grid",
          previewImageUrl: (type) =>
            `https://fakeimg.pl/800x450/ededed/545454?text=${type
              // Remove the "section." prefix
              .replace("section.", "")
              // Add a space before each uppercase letter
              .replace(/([A-Z])/g, " $1")
              // Trim any leading or trailing whitespace
              .trim()}&font=bebas`,
        },
      ],
    },
  },
});
