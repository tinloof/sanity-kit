import type { ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { Page } from "@/components/pages/modular";
import { loadPage } from "@/data/sanity";
import { resolveSanityMetadata } from "@/data/sanity/client";

export async function generateMetadata(
	props,
	parentPromise: ResolvingMetadata,
) {
	const parent = await parentPromise;

	const initialData = await loadPage("/");

	if (!initialData) return notFound();

	return resolveSanityMetadata({ ...initialData, parent });
}

export default async function IndexRoute() {
	const data = await loadPage("/");

	if (!data) return notFound();

	return <Page data={data} />;
}
