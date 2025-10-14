import {getRedirect} from "@tinloof/sanity-web";
import {sanityFetch} from "@/data/sanity/live";
import {NextRequest, NextResponse} from "next/server";

// In Next.js middleware
export async function middleware(request: NextRequest) {
  const redirect = await getRedirect({
    source: request.nextUrl.pathname,
    sanityFetch,
  });

  if (redirect) {
    return NextResponse.redirect(new URL(redirect.destination, request.url), {
      status: redirect.permanent ? 301 : 302,
    });
  }
}
