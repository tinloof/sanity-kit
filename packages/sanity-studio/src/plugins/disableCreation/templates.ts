import type { Template } from "sanity";

export default function getTemplates(
	templates: Template[],
	schemas: string[],
): Template[] {
	return templates?.filter(
		(template) => !schemas?.includes(template.schemaType),
	);
}
