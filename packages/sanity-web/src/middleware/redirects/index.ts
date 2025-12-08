import { type NextRequest, NextResponse } from "next/server";
import type { DefinedSanityFetchType } from "next-sanity/live";
import { getRedirect } from "../../utils/redirects";

export type RedirectIfNeededParams = {
	pathname: string;
	sanityFetch: DefinedSanityFetchType;
	request: NextRequest;
};

export async function redirectIfNeeded({
	pathname,
	sanityFetch,
	request,
}: RedirectIfNeededParams) {
	const redirect = await getRedirect({
		source: pathname,
		sanityFetch,
	});

	if (redirect ? redirect?.destination : false) {
		return NextResponse.redirect(new URL(redirect.destination, request.url), {
			status: redirect.permanent ? 301 : 302,
		});
	}
}
