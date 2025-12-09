import {defineField, type FieldDefinition, isDev} from "sanity";

import type {PathnameParams} from "../../types";
import {definePathname} from "../../utils/definePathname";

/**
 * Configuration options for the pathname slug field
 */
export type PathnameSlugFieldOptions = {
	/** Enable internationalization support */
	localized?: boolean;
	/** Default locale ID for i18n */
	defaultLocaleId?: string;
	/** Pathname field options */
	options?: PathnameParams["options"] & {
		/** Initial value for the pathname field */
		initialValue?: string;
	};
	/** Hide the pathname field */
	hidden?: boolean;
	/** Disallow creation of the document, used with the disableCreation plugin to make singletons */
	disableCreation?: boolean;
};

/**
 * Creates a pathname slug field with internationalization and folder support.
 *
 * This field provides:
 * - URL-friendly pathname generation
 * - Internationalization support with locale-specific pathnames
 * - Folder structure support for organizing pages
 * - Auto-navigation in Sanity Presentation
 * - Validation for unique pathnames across locales
 *
 * @param props - Configuration options for the pathname field
 * @returns A Sanity field definition for pathname/slug input
 *
 * @example
 * ```tsx
 * // Basic usage
 * pathnameSlugField()
 * ```
 *
 * @example
 * ```tsx
 * // With internationalization
 * pathnameSlugField({
 *   localized: true,
 *   defaultLocaleId: "en",
 *   options: {
 *     initialValue: "/",
 *     autoNavigate: true,
 *     prefix: "/blog",
 *     folder: {
 *       canUnlock: false,
 *     },
 *   },
 * })
 * ```
 */
export default function pathnameSlugField(
	props?: PathnameSlugFieldOptions,
): FieldDefinition {
	const {
		defaultLocaleId = undefined,
		localized = false,
		options = {},
		hidden = false,
		disableCreation = false,
	} = props || {};

	return defineField({
		...definePathname({
			options: {
				i18n:
					localized && defaultLocaleId
						? {
								defaultLocaleId: defaultLocaleId,
								enabled: true,
							}
						: undefined,
				...options,
			},
		}),
		readOnly: disableCreation && !isDev,
		hidden,
		initialValue: {current: options?.initialValue},
	});
}
