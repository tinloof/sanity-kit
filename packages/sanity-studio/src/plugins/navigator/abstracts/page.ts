import { defineAbstractResolver } from "@tinloof/sanity-extends";
import { defineType } from "sanity";

import {
	contentSchemaGroup,
	pathnameSlugField,
	seoObjectField,
	settingsSchemaGroup,
} from "../../../schemas";
import type { SEOObjectProps } from "../../../schemas/objects/seo";
import type { PathnameSlugFieldOptions } from "../../../schemas/slugs/pathname";
import type { PagesNavigatorPluginOptions } from "../../../types";

export default defineAbstractResolver((_schema, options) => {
	const { pathname, locales, defaultLocaleId, seo } =
		(options as {
			pathname?: PathnameSlugFieldOptions;
			seo?: SEOObjectProps;
		} & PagesNavigatorPluginOptions["i18n"]) ?? {};

	return defineType({
		name: "page",
		type: "abstract",
		groups: [contentSchemaGroup, settingsSchemaGroup],
		fields: [
			{
				...seoObjectField({ ...seo }),
				group: "settings",
			},
			{
				...pathnameSlugField({
					localized: !!locales?.length,
					defaultLocaleId,
					...pathname,
				}),
				group: "settings",
			},
		],
	});
});
