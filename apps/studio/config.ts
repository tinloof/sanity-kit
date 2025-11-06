const config = {
  projectId: process.env.SANITY_PROJECT_ID || "qfrmq8mg",
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: process.env.SANITY_API_VERSION || "2025-10-14",
  studioUrl: "/cms",
  i18n: {
    locales: [
      {id: "en", title: "English"},
      {id: "fr", title: "French"},
    ],
    defaultLocaleId: "en",
  },
};

export default config;
