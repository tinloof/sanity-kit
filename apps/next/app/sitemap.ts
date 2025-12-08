import { generateSanitySitemap } from "@tinloof/sanity-web/server";

import config from "@/config";
import { sanityFetch } from "@/data/sanity/live";

export default function Sitemap() {
	return generateSanitySitemap({
		sanityFetch,
		websiteBaseURL: config.baseUrl,
	});
}
