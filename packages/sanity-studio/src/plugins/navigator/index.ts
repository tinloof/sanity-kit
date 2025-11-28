import {resolveAbstractSchemaTypes} from "@tinloof/sanity-extends";
import {definePlugin} from "sanity";
import {presentationTool} from "sanity/presentation";

import {PathnameSlugFieldOptions} from "../../schemas/slugs/pathname";
import {PagesNavigatorPluginOptions, PathnameOptions} from "../../types";
import {pageAbstract} from "./abstracts";
import {createPagesNavigator} from "./components/DefaultPagesNavigator";
import {createPageTemplates, normalizeCreatablePages} from "./utils";

const ABSTRACT_SCHEMA_MAP = {
  page: pageAbstract,
} as const;
/**
 * The `pages` plugin is a wrapper around Sanity's `presentation` plugin.
 * When enabled, it will add Tinloof's pages navigator to the prensentation view.
 * With this plugin, you can easily navigate through your content and quickly create new documents.
 *
 * @example
 *
 * ```tsx
 * import { pages } from '@tinloof/sanity-studio'
 *
 * export default defineConfig({
 *  plugins: [
 *    pages({
 *      previewUrl: {
 *        previewMode: {
 *          enable: '/api/draft',
 *        },
 *      },
 *      creatablePages: ['page'],
 *    }),
 *  ],
 * })
 * ```
 */
export const pages = definePlugin<PagesNavigatorPluginOptions>((config) => {
  const normalizedCreatablePages = normalizeCreatablePages(
    config.creatablePages,
  );

  const abstracts = config?.abstracts ?? {page: true};

  return {
    name: "tinloof-pages-navigator",
    schema: {
      types: resolveAbstractSchemaTypes(ABSTRACT_SCHEMA_MAP, abstracts, config),
      templates: createPageTemplates(normalizedCreatablePages),
    },
    plugins: [
      presentationTool({
        ...config,
        title: config.title ?? "Pages",
        components: {
          unstable_navigator: {
            component: createPagesNavigator({
              i18n: config.i18n,
              creatablePages: normalizedCreatablePages,
              folders: config.folders,
              filterBasedOnRoles: config.filterBasedOnRoles,
            }),
            minWidth: config.navigator?.minWidth ?? 320,
            maxWidth: config.navigator?.maxWidth ?? 480,
          },
          ...config.components,
        },
      }),
    ],
  };
});

/**
 * @deprecated use `import { pages } from '@tinloof/sanity-studio'` instead
 */
export const pagesNavigator = pages;

declare module "@tinloof/sanity-extends" {
  export interface ExtendsWith {
    page: {
      abstract: "page";
      pathname?: Omit<PathnameOptions, "i18n"> &
        Pick<PathnameSlugFieldOptions, "disableCreation">;
    };
  }
}
