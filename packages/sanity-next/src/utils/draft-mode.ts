import type {SanityClient} from "@sanity/client";
import {defineEnableDraftMode} from "next-sanity/draft-mode";
import type {NextRequest} from "next/server";

/**
 * Creates a draft mode route handler for Next.js API routes
 * @param client - Sanity client instance with token already configured
 * @returns GET handler for the draft mode API route
 */
export function createDraftModeRoute(client: SanityClient) {
	return defineEnableDraftMode({
		client,
	});
}

/**
 * Helper to create the draft mode API route handlers
 * This should be exported from your /api/draft/route.ts file
 * @param client - Sanity client instance with token already configured
 * @returns Object with GET handler compatible with Next.js 16
 */
export function defineDraftRoute(client: SanityClient) {
	const handler = createDraftModeRoute(client);
	return {
		// Wrap the handler to match Next.js 16's expected signature
		GET: async (request: NextRequest, context: {params: Promise<{}>}) => {
			// @ts-expect-error - next-sanity handler expects different signature
			return handler.GET(request, context);
		},
	};
}

/**
 * Creates a draft route handler that returns an error response when called without proper configuration
 * @param errorMessage - The error message to return
 * @returns Object with GET handler that returns an error response
 */
export function createErrorDraftRoute(errorMessage: string) {
	return {
		GET: async () => {
			return new Response(
				JSON.stringify({
					error: errorMessage,
					message: "Draft mode configuration error",
				}),
				{
					status: 500,
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
		},
	};
}
