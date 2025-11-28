import {defineConfig, isDev} from "sanity";
import {visionTool} from "@sanity/vision";

import {pages} from "@tinloof/sanity-studio";
import config from "./config";
import schemas from "./src/schemas";
import {documentOptions} from "@tinloof/sanity-document-options";
import {withExtends} from "@tinloof/sanity-extends";
import {documentI18n} from "@tinloof/sanity-document-i18n";

export default defineConfig({
  name: "sanity-basic-studio",
  title: "Sanity Basic Studio",
  projectId: config.projectId,
  dataset: config.dataset,
  plugins: [
    documentOptions({}),
    documentI18n({
      locales: [
        {title: "English", id: "en"},
        {title: "French", id: "fr"},
      ],
    }),
    pages({
      i18n: {
        locales: [
          {title: "English", id: "en"},
          {title: "French", id: "fr"},
        ],
        defaultLocale: "en",
      },
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
