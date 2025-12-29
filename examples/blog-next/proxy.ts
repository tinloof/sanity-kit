import {type NextRequest} from "next/server";

import {redirectIfNeeded} from "./data/sanity/client";

export async function proxy(request: NextRequest) {
	await redirectIfNeeded({request});
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|cms|sitemap\\.xml|robots\\.txt).*)",
	],
};
