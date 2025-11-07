import {defineConfig, isDev} from "sanity";
import {structureTool} from "sanity/structure";
import {visionTool} from "@sanity/vision";

import {
  defineActions,
  defineNewDocumentOptions,
  defineSchemaTemplates,
  defineStructure,
  documentI18n,
  pages,
} from "@tinloof/sanity-studio";
import config from "./config";
import schemas from "./src/schemas";

export default defineConfig({
  name: "sanity-basic-studio",
  title: "Sanity Basic Studio",
  projectId: config.projectId,
  dataset: config.dataset,
  plugins: [
    structureTool({
      title: "General",
      structure: (S, context) =>
        defineStructure(S, context, {
          locales: config.i18n.locales,
          hide: ["translation.metadata"],
        }),
    }),
    pages({
      creatablePages: ["page"],
      previewUrl: {
        origin: isDev ? "http://localhost:3000" : undefined,
        previewMode: {
          enable: "/api/draft",
        },
      },
      i18n: config.i18n,
      allowOrigins: isDev ? ["http://localhost:3000"] : undefined,
    }),
    documentI18n({schemas, locales: config.i18n.locales}),
    visionTool({defaultApiVersion: config.apiVersion}),
  ],
  schema: {
    types: schemas,
    templates: defineSchemaTemplates,
  },
  document: {
    actions: defineActions,
    newDocumentOptions: defineNewDocumentOptions,
  },
});
