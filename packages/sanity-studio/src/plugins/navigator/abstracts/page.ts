import {defineAbstractResolver} from "@tinloof/sanity-extends";

import {
	contentSchemaGroup,
	pathnameSlugField,
	seoObjectField,
	settingsSchemaGroup,
} from "../../../schemas";
import type {SEOObjectProps} from "../../../schemas/objects/seo";
import type {PathnameSlugFieldOptions} from "../../../schemas/slugs/pathname";
import type {PagesNavigatorPluginOptions} from "../../../types";

export default defineAbstractResolver((_schema, options) => {
	const {pathname, locales, defaultLocaleId, seo} =
		(options as {
			pathname?: PathnameSlugFieldOptions;
			seo?: SEOObjectProps;
		} & PagesNavigatorPluginOptions["i18n"]) ?? {};

	return {
		name: "page",
		type: "abstract",
		groups: [contentSchemaGroup, settingsSchemaGroup],
		fields: [
			{
				...pathnameSlugField({
					localized: !!locales?.length,
					defaultLocaleId,
					...pathname,
				}),
				group: "settings",
			},
			{
				...seoObjectField({...seo}),
				group: "settings",
			},
		],
		preview: {
			select: {
				title: "title",
				name: "name",
				heading: "heading",
				pathname: "pathname.current",
			},
			prepare: ({title, name, heading, pathname}) => ({
				title: title || name || heading || "Untitled",
				subtitle: pathname,
			}),
		},
	};
});
