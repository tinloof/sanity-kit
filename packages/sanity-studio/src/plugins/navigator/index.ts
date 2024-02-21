import { definePlugin } from "sanity";

import { presentationTool } from "sanity/presentation";
import { PagesNavigatorPluginOptions } from "../../types";
import { createPagesNavigator } from "./components/DefaultPagesNavigator";
import { createPageTemplates, normalizeCreatablePages } from "./utils";

export const pagesNavigator = definePlugin<PagesNavigatorPluginOptions>(
  (config) => {
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
          components: {
            unstable_navigator: {
              component: createPagesNavigator({
                i18n: config.i18n,
                creatablePages: normalizedCreatablePages,
              }),
              minWidth: 360,
              maxWidth: 480,
            },
            ...config.components,
          },
        }),
      ],
    };
  }
);
