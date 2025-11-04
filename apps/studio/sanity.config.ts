import {defineConfig, isDev, SchemaTypeDefinition} from "sanity";
import {structureTool} from "sanity/structure";
import {visionTool} from "@sanity/vision";

import {disableCreation, importAllSchemas, pages} from "@tinloof/sanity-studio";
import config from "./config";
import {disableCreationDocumentTypes, structure} from "./src/structure";
import schemas from "./src/schemas";

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
  ],
  schema: {
    types: schemas as SchemaTypeDefinition[],
  },
});
