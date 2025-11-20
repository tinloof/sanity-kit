import {defineConfig, isDev} from "sanity";
import {structureTool} from "sanity/structure";
import {visionTool} from "@sanity/vision";

import {disableCreation, pages} from "@tinloof/sanity-studio";
import config from "./config";
import {disableCreationDocumentTypes, structure} from "./src/structure";
import schemas from "./src/schemas";
import {documentI18n} from "@tinloof/sanity-document-i18n";

export default defineConfig({
  name: "sanity-basic-studio",
  title: "Sanity Basic Studio",
  projectId: config.projectId,
  dataset: config.dataset,
  plugins: [
    structureTool({title: "General", structure}),
    pages({
      creatablePages: ["page"],
      previewUrl: {
        origin: isDev ? "http://localhost:3000" : undefined,
        previewMode: {
          enable: "/api/draft",
        },
      },
      allowOrigins: isDev ? ["http://localhost:3000"] : undefined,
    }),
    visionTool({defaultApiVersion: config.apiVersion}),
    disableCreation({
      schemas: disableCreationDocumentTypes,
    }),
    documentI18n({
      locales: [
        {id: "en", title: "English"},
        {id: "fr", title: "French"},
      ],
    }),
  ],
  schema: {
    types: schemas,
  },
});
