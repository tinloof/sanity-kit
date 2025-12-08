import type {
	DocumentDefinition,
	FieldDefinition,
	IntrinsicTypeName,
	SchemaTypeDefinition,
} from "sanity";

export type AbstractDefinition = Omit<DocumentDefinition, "type" | "fields"> & {
	type: "abstract";
	fields?: FieldDefinition<IntrinsicTypeName>[];
};

export type AbstractDefinitionResolver = (
	document: DocumentDefinition,
	options?: object | boolean,
) => AbstractDefinition;

export type ExtendedType =
	| SchemaTypeDefinition<IntrinsicTypeName>
	| AbstractDefinitionResolver;

/**
 * Registry for custom extends types. Users can extend this interface
 * to add type-safe autocomplete for their abstract resolvers.
 *
 * The type of each key determines whether `parameters` is required:
 * - **Required parameters**: If any key is required (e.g., `source: string`),
 *   you must provide `parameters` when using the object syntax.
 * - **Optional parameters**: If all keys are optional (e.g., `defaultTitle?: string`),
 *   `parameters` is optional.
 * - **No parameters**: Use `undefined` to indicate the abstract takes no parameters.
 *
 * Registered names also appear in autocomplete when using the string syntax
 * (e.g., `extends: "sluggable"` or `extends: ["seo", "publishable"]`).
 *
 * @example
 * ```ts
 * declare module "@tinloof/sanity-extends" {
 *   interface ExtendsRegistry {
 *     // Required: `parameters` must be provided with `source`
 *     sluggable: { source: string; maxLength?: number };
 *
 *     // Optional: `parameters` can be omitted or provided
 *     seo: { defaultTitle?: string };
 *
 *     // None: `parameters` is not allowed
 *     publishable: undefined;
 *   }
 * }
 *
 * // Usage:
 * extends: { type: "sluggable", parameters: { source: "title" } } // ✓ required
 * extends: { type: "seo" }                                        // ✓ optional
 * extends: { type: "publishable" }                                // ✓ no params
 * extends: "publishable"                                          // ✓ string syntax
 * extends: ["seo", "publishable"]                                 // ✓ array syntax
 * ```
 */
// biome-ignore lint/suspicious/noEmptyInterface: Empty interface needed for module augmentation
export interface ExtendsRegistry {}

type RegisteredExtendName = keyof ExtendsRegistry extends never
	? string
	: keyof ExtendsRegistry | (string & {});

type TypedExtendsEntry = keyof ExtendsRegistry extends never
	? never
	: {
			[K in keyof ExtendsRegistry]: ExtendsRegistry[K] extends
				| undefined
				| void
				| never
				? { type: K; parameters?: never }
				: {} extends Required<ExtendsRegistry[K]>
					? {
							type: K;
							parameters?: ExtendsRegistry[K];
						}
					: {
							type: K;
							parameters: ExtendsRegistry[K];
						};
		}[keyof ExtendsRegistry];

export type ExtendsOptionsArrayEntry = keyof ExtendsRegistry extends never
	? { type: string; parameters?: Record<string, any> }
	: TypedExtendsEntry;

export type ExtendsOptionsArray = Array<
	ExtendsOptionsArrayEntry | RegisteredExtendName
>;

export type ExtendsOption =
	| ExtendsOptionsArray
	| ExtendsOptionsArrayEntry
	| RegisteredExtendName;

declare module "sanity" {
	export interface IntrinsicDefinitions {
		abstract: AbstractDefinition;
	}

	export interface DocumentDefinition {
		extends?: ExtendsOption;
	}
}

/**
 * Generic helper type for creating abstracts configuration.
 * Generates a configuration type that allows disabling all abstracts
 * or enabling/disabling specific document types.
 *
 * @template T - Union of document type names that can support abstracts
 *
 * @example
 * ```ts
 * // Single document type
 * type PageAbstracts = CreateAbstractsConfig<"page">;
 * // Result: false | { page?: boolean }
 *
 * // Multiple document types
 * type MyAbstracts = CreateAbstractsConfig<"page" | "article" | "product">;
 * // Result: false | { page?: boolean; article?: boolean; product?: boolean }
 *
 * // Usage in configuration
 * const config1: MyAbstracts = false; // Disable all
 * const config2: MyAbstracts = { page: true, article: false }; // Selective
 *
 * // Extend for custom document types
 * type CustomDocTypes = "blogPost" | "landingPage" | "caseStudy";
 * type CustomAbstracts = CreateAbstractsConfig<CustomDocTypes>;
 * ```
 */
export type CreateAbstractsConfig<T extends string> =
	| false
	| {
			[K in T]?: boolean;
	  };
