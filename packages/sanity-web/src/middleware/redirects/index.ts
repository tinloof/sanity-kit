import {DefinedSanityFetchType} from "next-sanity";
import {NextResponse, NextRequest} from "next/server";
import {getRedirect} from "../../utils/redirects";

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

  if (redirect && redirect?.destination) {
    return NextResponse.redirect(new URL(redirect.destination, request.url), {
      status: redirect.permanent ? 301 : 302,
    });
  }
}
