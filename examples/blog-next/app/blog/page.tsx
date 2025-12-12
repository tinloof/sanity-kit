import {resolveSanityMetadata} from "@/data/sanity/client";
import {notFound} from "next/navigation";
import type {PageProps} from "@tinloof/sanity-next";
import {sanityFetch} from "@/data/sanity/client";
import {defineQuery} from "next-sanity";
import {ResolvingMetadata} from "next";
import {BLOG_INDEX_QUERY} from "@examples/blog-studio/queries";
import {BlogIndex} from "@/components/templates/blog-index";

type BlogRouteProps = PageProps<"tag">;

const BLOG_INDEX_SEO_QUERY = defineQuery(`
  *[_type == "blog.index"][0] {
    seo,
    pathname,
  }
`);

export async function generateMetadata(
	_props: BlogRouteProps,
	parent: ResolvingMetadata,
) {
	const {data} = await sanityFetch({query: BLOG_INDEX_SEO_QUERY});

	if (!data) return notFound();

	return resolveSanityMetadata({
		...data,
		pathname: data.pathname ?? undefined,
		seo: data.seo ?? undefined,
		parent: await parent,
	});
}

const ENTRIES_PER_PAGE = 2;

export default async function BlogIndexRoute({params}: BlogRouteProps) {
	const {tag} = await params;

	const {data} = await sanityFetch({
		query: BLOG_INDEX_QUERY,
		params: {
			filterTag: tag ?? null,
			pageStart: 0,
			pageNumber: 1,
			pageEnd: ENTRIES_PER_PAGE,
			entriesPerPage: ENTRIES_PER_PAGE,
		},
	});

	if (!data) return notFound();

	return (
		<BlogIndex
			entriesPerPage={ENTRIES_PER_PAGE}
			initialData={data}
			tagParam={tag}
		/>
	);
}
