import {sectionsBodyArraySchema} from "@tinloof/sanity-studio";
import {defineField} from "sanity";
import sections from "./sections";

export default defineField({...sectionsBodyArraySchema({sections})});
