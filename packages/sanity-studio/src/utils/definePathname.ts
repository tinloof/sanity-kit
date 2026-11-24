import type {ComponentType} from "react";
import {
	type CurrentUser,
	defineField,
	type FieldDefinition,
	type ObjectFieldProps,
	type ObjectSchemaType,
	type SanityDocument,
	type SlugValidationContext,
	type SlugValue,
} from "sanity";

import {PathnameFieldComponent} from "../components/PathnameFieldComponent";
import type {PathnameOptions, PathnameParams} from "../types";

export function definePathname(
	schema: PathnameParams = {name: "pathname"},
): FieldDefinition<"slug"> {
	const slugOptions = schema?.options;
	const fieldName = schema.name ?? "pathname";

	return defineField({
		...schema,
		name: fieldName,
		title: schema?.title ?? "URL",
		type: "slug",
		components: {
			...schema.components,
			field: (schema.components?.field ??
				PathnameFieldComponent) as unknown as ComponentType<
				ObjectFieldProps<SlugValue>
			>,
		},
		options: {
			...(slugOptions ?? {}),
			isUnique:
				slugOptions?.isUnique ??
				((slug, context) => isUnique(slug, context, fieldName)),
		},
		// Normalize this field's slug rules after its custom options are available.
		// Sanity 6.13 otherwise inherits the default uniqueness rule too early.
		validation: schema.validation ?? ((rule) => rule),
	});
}

async function isUnique(
	slug: string,
	context: SlugValidationContext,
	fieldName: string,
): Promise<boolean> {
	const {document, getClient, schema} = context;

	if (!document) throw new Error("Cannot resolve pathname without a document");

	const client = getClient({apiVersion: "2023-06-21"});
	const id = document._id.replace(/^drafts\./, "");
	let currentUser: Promise<CurrentUser | null> | undefined;

	const resolvePath = async (doc: SanityDocument, pathname: string) => {
		const field = (
			schema.get(doc._type) as ObjectSchemaType | undefined
		)?.fields?.find((field) => field.name === fieldName);
		const prefix = (field?.type.options as PathnameOptions | undefined)?.prefix;
		if (typeof prefix === "function" && !currentUser) {
			currentUser = client.request<CurrentUser | null>({uri: "/users/me"});
		}
		const resolved =
			typeof prefix === "function"
				? await prefix(doc, {
						getClient,
						schema,
						currentUser: await currentUser!,
						projectId: client.config().projectId!,
						dataset: client.config().dataset!,
					})
				: prefix;
		if (
			(typeof prefix === "function" || resolved !== undefined) &&
			typeof resolved !== "string"
		) {
			throw new Error("Pathname prefix must resolve to a string");
		}
		// A relative prefix such as "blog" and "/blog" address the same route.
		return `${resolved && !resolved.startsWith("/") && !resolved.includes("://") ? "/" : ""}${resolved ?? ""}${pathname}`;
	};
	const path = await resolvePath(document as SanityDocument, slug);
	// Keep uniqueness scoped to this field name across document types.
	// A quoted GROQ attribute keeps the configured name a literal, not query syntax.
	const fieldPath = `@[${JSON.stringify(fieldName)}].current`;
	const paths = new Set<string>();
	// Prefixes are prepended verbatim, so every possible stored pathname is a
	// suffix of the resolved path. Include non-segment suffixes for dynamic prefixes.
	for (const target of [path, path.replace(/\/$/, "")]) {
		for (let index = 0; index < target.length; index++)
			paths.add(target.slice(index));
	}
	let after = "";
	while (true) {
		const candidates = await client.fetch<SanityDocument[]>(
			`*[!(_id in [$draft, $published]) && ${fieldPath} in $paths && locale == $locale && _id > $after] | order(_id asc)[0...100]`,
			{
				draft: `drafts.${id}`,
				published: id,
				paths: [...paths],
				locale: document.locale ?? null,
				after,
			},
		);
		for (const candidate of candidates) {
			const candidatePath = await resolvePath(
				candidate,
				(candidate[fieldName] as SlugValue).current!,
			);
			if (candidatePath === path || candidatePath === path.replace(/\/$/, ""))
				return false;
		}
		if (candidates.length < 100) return true;
		after = candidates[candidates.length - 1]._id;
	}
}
