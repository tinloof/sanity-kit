import {defineConfig, isDev} from "sanity";
import {visionTool} from "@sanity/vision";

import {
  defineActions,
  defineNewDocumentOptions,
  defineSchemaTemplates,
  documentI18n,
  pages,
} from "@tinloof/sanity-studio";
import config from "./config";
import schemas from "./src/schemas";
import {inlineStructure} from "@tinloof/sanity-inline-structure";

export default defineConfig({
  name: "sanity-basic-studio",
  title: "Sanity Basic Studio",
  projectId: config.projectId,
  dataset: config.dataset,
  plugins: [
    inlineStructure({
      hide: ["translation.metadata"],
      locales: config.i18n.locales,
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
