import {generateSanitySitemap} from "@tinloof/sanity-web/server";

import {sanityFetch} from "@/data/sanity/live";
import config from "@/config";

export default function Sitemap() {
  return generateSanitySitemap({
    sanityFetch,
    websiteBaseURL: config.baseUrl,
  });
}
