import {
	PAGE_QUERY,
	STATIC_PATHS_QUERY,
} from "@examples/hello-world-i18n-studio/queries";
import type { PageProps } from "@tinloof/sanity-next";
import type { ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import PageTemplate from "@/components/templates/page";
import { resolveSanityMetadata, sanityFetch } from "@/data/sanity/client";

type CatchAllRouteProps = PageProps<"locale" | "...path">;

export async function generateMetadata(
	props: CatchAllRouteProps,
	parent: ResolvingMetadata,
) {
	const { locale, path } = await props.params;

	let pathname: string;

	if (Array.isArray(path)) {
		pathname = "/" + path.join("/");
	} else {
		pathname = "/" + path;
	}

	const { data } = await sanityFetch({
		params: { locale, pathname },
		query: PAGE_QUERY,
		stega: false,
	});

	if (!data) return notFound();

	return resolveSanityMetadata({ ...data, parent: await parent });
}

export default async function CatchAllPage(props: CatchAllRouteProps) {
	const { locale, path } = await props.params;

	let pathname: string;

	if (Array.isArray(path)) {
		pathname = "/" + path.join("/");
	} else {
		pathname = "/" + path;
	}

	const { data } = await sanityFetch({
		params: { locale, pathname },
		query: PAGE_QUERY,
	});

	if (!data) return notFound();

	return <PageTemplate data={data} />;
}

export async function generateStaticParams() {
	const { data } = await sanityFetch({
		query: STATIC_PATHS_QUERY,
		perspective: "published",
		stega: false,
	});

	if (!data || data.length === 0) return [];

	const staticPaths =
		data
			?.map((page) => {
				const path = page.pathname?.split("/");
				return {
					locale: page?.locale ?? "en",
					path: path?.filter((str) => str !== ""),
				};
			})
			.filter(({ path }) => (path?.length || 0) > 0) || [];

	return staticPaths;
}
