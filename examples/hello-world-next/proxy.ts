import {NextResponse, ProxyConfig, NextProxy} from "next/server";
import sanity from "@/lib/sanity";

export const proxy: NextProxy = async (request) => {
  await sanity.redirectIfNeeded({request});

  return NextResponse.next();
};

export const config: ProxyConfig = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|studio|static).*)"],
};
