import { presentationTool } from "@sanity/presentation";
import { definePlugin } from "sanity";

import { PagesNavigatorPluginOptions } from "../../types";
import { createPagesNavigator } from "./components/DefaultPagesNavigator";
import { createPageTemplates, normalizeCreatablePages } from "./utils";
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
 *        draftMode: {
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
    config.creatablePages
  );
  return {
    name: "tinloof-pages-navigator",
    schema: {
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
