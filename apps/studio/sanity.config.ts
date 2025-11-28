import {defineConfig, isDev} from "sanity";
import {visionTool} from "@sanity/vision";

import {pages} from "@tinloof/sanity-studio";
import config from "./config";
import schemas from "./src/schemas";
import {documentOptions} from "@tinloof/sanity-document-options";
import {withExtends} from "@tinloof/sanity-extends";

export default defineConfig({
  name: "sanity-basic-studio",
  title: "Sanity Basic Studio",
  projectId: config.projectId,
  dataset: config.dataset,
  plugins: [
    documentOptions({}),
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
  ],
  schema: {
    types: withExtends(schemas),
  },
});
