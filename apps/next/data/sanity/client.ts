import config from "@/config";
import {createSanityMetadataResolver} from "@tinloof/sanity-web";
import {ClientPerspective, createClient} from "next-sanity";

const clientConfig = {
  projectId: config.sanity.projectId,
  dataset: config.sanity.dataset,
  apiVersion: config.sanity.apiVersion,
  useCdn: process.env.NODE_ENV === "production",
  perspective: "published" as ClientPerspective,
};

export const client = createClient({
  ...clientConfig,
  stega: {
    studioUrl: config.sanity.studioUrl,
  },
});

export const resolveSanityMetadata = createSanityMetadataResolver({
  client,
  websiteBaseURL: config.baseUrl,
});
