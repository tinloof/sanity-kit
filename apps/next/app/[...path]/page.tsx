import type {ResolvingMetadata} from "next";
import {notFound} from "next/navigation";
import {Page} from "@/components/pages/modular";
import {loadPage} from "@/data/sanity";
import {resolveSanityMetadata} from "@/data/sanity/client";
import type {PageProps} from "@/types";

export type DynamicRouteProps = PageProps<"...path", any>;

export async function generateMetadata(
	{params}: DynamicRouteProps,
	parentPromise: ResolvingMetadata,
) {
	const parent = await parentPromise;

	const {path} = await params;

	const data = await loadPage(`/${path.join("/")}`);

	if (!data) return notFound();

	return resolveSanityMetadata({...data, parent});
}

export default async function DynamicRoute({params}: DynamicRouteProps) {
	const {path} = await params;

	const pathname = `/${path.join("/")}`;

	const data = await loadPage(pathname);

	if (!data) return notFound();

	return <Page data={data} />;
}
