import type { DocumentDefinition } from "sanity";
import type {
	DefaultDocumentNodeContext,
	DocumentBuilder,
	StructureBuilder,
} from "sanity/structure";

/**
 * Applies custom views configuration from schema options.
 * @internal
 */
export default function defineDefaultDocumentNode(
	S: StructureBuilder,
	context: DefaultDocumentNodeContext,
): DocumentBuilder | null | undefined {
	const {
		schema: { _original },
	} = context;
	const documentSchemas = _original?.types.filter(
		({ type }) => type === "document",
	) as DocumentDefinition[];

	const schema = documentSchemas.find((s) => s.name === context.schemaType);
	const structureOptions = schema?.options?.structureOptions;

	// Only check for views if structureOptions is an object (not a function)
	if (structureOptions && typeof structureOptions === "object") {
		const views = structureOptions.views;
		if (views && typeof views === "function") {
			return S.document().views([S.view.form(), ...views(S)]);
		}
	}

	return S.document().views([S.view.form()]);
}
