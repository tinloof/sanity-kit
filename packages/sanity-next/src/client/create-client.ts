import {
	type ClientConfig,
	createClient as sanityCreateClient,
} from "@sanity/client";

/**
 * Creates a Sanity client with predefined environment variables and default values.
 * Can be used in both client and server components.
 * @param config - Optional client configuration to override defaults
 * @returns A configured Sanity client
 */
export function createClient(config?: ClientConfig) {
	const projectId = process.env["NEXT_PUBLIC_SANITY_PROJECT_ID"];
	const dataset = process.env["NEXT_PUBLIC_SANITY_DATASET"];
	const apiVersion = process.env["SANITY_API_VERSION"];

	if (!projectId) {
		throw new Error(
			"NEXT_PUBLIC_SANITY_PROJECT_ID environment variable is not defined. This is required to create the Sanity client.",
		);
	}

	if (!dataset) {
		throw new Error(
			"NEXT_PUBLIC_SANITY_DATASET environment variable is not defined. This is required to create the Sanity client.",
		);
	}

	const clientConfig: ClientConfig = {
		projectId,
		dataset,
		apiVersion: apiVersion || "2025-10-01",
		useCdn: process.env.NODE_ENV === "production",
		perspective: "published",
		stega: {
			studioUrl: "/cms",
		},
		...config,
	};

	return sanityCreateClient(clientConfig);
}
