import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import appConfig from "@/config";

export async function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;
	const searchParams = request.nextUrl.searchParams;

	// Check if there is any supported locale in the pathname
	const pathnameIsMissingLocale = appConfig.i18n.locales.every(
		(locale) =>
			!pathname.startsWith(`/${locale.id}/`) && pathname !== `/${locale.id}`,
	);

	// Redirect if there is no locale
	if (pathnameIsMissingLocale) {
		const searchString = searchParams.toString();

		return NextResponse.rewrite(
			new URL(
				`/${appConfig.i18n.defaultLocaleId}${pathname}${searchString ? `?${searchString}` : ""}`,
				request.url,
			),
		);
	}
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|studio|static).*)"],
};
