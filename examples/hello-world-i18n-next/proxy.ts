import {type NextRequest, NextResponse} from "next/server";

import {redirectIfNeeded} from "./data/sanity/client";

export async function proxy(request: NextRequest) {
	const {pathname, searchParams} = request.nextUrl;

	await redirectIfNeeded({request});

	/**
	 * Internationalization
	 */
	const pathnameIsMissingLocale = ["en", "fr"].every(
		(locale) =>
			// Check if there is any supported locale in the pathname
			!pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
	);
	if (pathnameIsMissingLocale) {
		const searchString = searchParams.toString();
		return NextResponse.rewrite(
			new URL(
				`/en${pathname}${searchString ? `?${searchString}` : ""}`,
				request.url,
			),
		);
	}
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|cms|sitemap\\.xml|robots\\.txt).*)",
	],
};
