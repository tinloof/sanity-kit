import type {PageProps} from "@tinloof/sanity-next";
import type {ResolvingMetadata} from "next";
import {notFound} from "next/navigation";
import {defineQuery} from "next-sanity";
import BlogPostTemplate from "@/components/templates/blog-post";
import PageTemplate from "@/components/templates/page";
import {resolveSanityMetadata, sanityFetch} from "@/data/sanity/client";

type CatchAllRouteProps = PageProps<"...path">;

const STATIC_PATHS_QUERY = defineQuery(`
  *[pathname.current != null && seo.indexable && _type in $types] {
    locale,
    "pathname": pathname.current,
  }
`);

const PAGE_QUERY = defineQuery(`
  *[_type == "modular.page" && pathname.current == $pathname][0] {
    pathname,
    _type,
    sections[],
    seo,
  }`);

const BLOG_POST_QUERY = defineQuery(`
  *[_type == "blog.post" && pathname.current == $pathname][0] {
    pathname,
    _type,
    publishedAt,
    title,
    authors[] {
      _key,
      ...@-> {
        name,
        avatar,
      },
    },
    tags[] {
      _key,
      ...@-> {
        title,
        slug,
      },
    },
    ptBody,
    seo,
  }`);

const ROUTE_QUERY = defineQuery(`
  *[pathname.current == $pathname][0] {
    _type,
  }
`);

function getQueryByType(type: string) {
	switch (type) {
		case "blog.post":
			return BLOG_POST_QUERY;
		case "modular.page":
			return PAGE_QUERY;
		default:
			return null;
	}
}

async function fetchPageData(path: string | string[], stega = true) {
	let pathname: string;

	if (Array.isArray(path)) {
		pathname = "/" + path.join("/");
	} else {
		pathname = "/" + path;
	}

	const {data: route} = await sanityFetch({
		params: {pathname},
		query: ROUTE_QUERY,
		stega: false,
	});

	if (!route) return null;

	const query = getQueryByType(route._type);
	if (!query) return null;

	const {data} = await sanityFetch({
		params: {pathname},
		query,
		stega,
	});

	return data;
}

export async function generateMetadata(
	props: CatchAllRouteProps,
	parent: ResolvingMetadata,
) {
	const {path} = await props.params;

	const data = await fetchPageData(path, false);

	if (!data) return notFound();

	return resolveSanityMetadata({
		...data,
		title: "title" in data ? (data.title ?? undefined) : undefined,
		pathname: data.pathname ?? undefined,
		seo: data.seo ?? undefined,
		parent: await parent,
	});
}

export default async function CatchAllPage(props: CatchAllRouteProps) {
	const {path} = await props.params;

	const data = await fetchPageData(path);

	if (!data) return notFound();

	switch (data._type) {
		case "blog.post":
			return <BlogPostTemplate data={data} />;
		case "modular.page":
			return <PageTemplate data={data} />;
		default:
			return notFound();
	}
}

export async function generateStaticParams() {
	const {data} = await sanityFetch({
		query: STATIC_PATHS_QUERY,
		params: {types: ["blog.post", "modular.page"]},
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
			.filter(({path}) => (path?.length || 0) > 0) || [];

	return staticPaths;
}
