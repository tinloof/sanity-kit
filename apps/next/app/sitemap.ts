import {generateSanitySitemap} from "@tinloof/sanity-next/utils/sitemap";

import config from "@/config";
import {sanityFetch} from "@/data/sanity/live";

export default function Sitemap() {
	return generateSanitySitemap({
		sanityFetch,
		websiteBaseURL: config.baseUrl,
	});
}
