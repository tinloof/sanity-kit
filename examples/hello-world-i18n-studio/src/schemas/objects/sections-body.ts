import { sectionsBodyArraySchema } from "@tinloof/sanity-studio";
import { defineType } from "sanity";
import sections from "./sections";

export default defineType({
	...sectionsBodyArraySchema({ sections }),
});
