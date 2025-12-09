import {type NextRequest, NextResponse} from "next/server";
import {redirectIfNeeded} from "./data/sanity/client";

// In Next.js middleware
export async function middleware(request: NextRequest) {
	await redirectIfNeeded({request});
}
