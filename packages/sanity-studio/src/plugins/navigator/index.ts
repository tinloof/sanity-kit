import { definePlugin } from "sanity";

import { presentationTool } from "sanity/presentation";
import { PagesNavigatorPluginOptions } from "../../types";
import { createPagesNavigator } from "./components/DefaultPagesNavigator";
import { createPageTemplates, normalizeCreatablePages } from "./utils";

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
