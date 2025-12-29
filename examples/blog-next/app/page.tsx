import type {PageProps} from "@tinloof/sanity-next";
import type {ResolvingMetadata} from "next";
import {notFound} from "next/navigation";
import {defineQuery} from "next-sanity";
import PageTemplate from "@/components/templates/page";
import {resolveSanityMetadata, sanityFetch} from "@/data/sanity/client";

const HOME_QUERY = defineQuery(`
  *[_type == "home"][0] {
    _type,
    sections[],
  }`);

export async function generateMetadata(
	_props: PageProps,
	parent: ResolvingMetadata,
) {
	const {data} = await sanityFetch({
		query: HOME_QUERY,
	});

	if (!data) return notFound();

	return resolveSanityMetadata({...data, parent: await parent});
}

export default async function HomePage() {
	const {data} = await sanityFetch({
		query: HOME_QUERY,
	});

	if (!data) return notFound();

	return <PageTemplate data={data} />;
}
