import { type ClientPerspective, createClient } from "@sanity/client";
import config from "@/config";

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
		// logger: console,
	},
});
