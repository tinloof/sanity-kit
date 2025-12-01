import {defineConfig, isDev} from "sanity";
import {visionTool} from "@sanity/vision";

import {pages} from "@tinloof/sanity-studio";
import schemas from "./src/schemas";
import {documentOptions} from "@tinloof/sanity-document-options";
import {withExtends} from "@tinloof/sanity-extends";
import {documentI18n} from "@tinloof/sanity-document-i18n";

import "./globals.css";

const locales = [
  {id: "en", title: "English"},
  {id: "fr", title: "French"},
];

export default defineConfig({
  name: "hello-world-i18n",
  title: "Hello World i18n",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || "rnkfj9jg",
  dataset: process.env.SANITY_STUDIO_DATASET || "production",
  plugins: [
    documentI18n({
      locales,
    }),
    documentOptions({structure: {locales}}),
    pages({
      i18n: {
        locales,
        defaultLocaleId: locales[0].id,
      },
      creatablePages: ["modular.page"],
      previewUrl: {
        origin: isDev ? "http://localhost:3000" : undefined,
        previewMode: {
          enable: "/api/draft",
        },
      },
      allowOrigins: isDev ? ["http://localhost:3000"] : undefined,
    }),
    visionTool({
      defaultApiVersion: process.env.SANITY_STUDIO_API_VERSION || "2025-12-01",
    }),
  ],
  schema: {
    types: withExtends(schemas),
  },
});
