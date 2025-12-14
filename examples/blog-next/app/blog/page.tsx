import {BLOG_INDEX_QUERY} from "@examples/blog-studio/queries";
import type {PageProps} from "@tinloof/sanity-next";
import type {ResolvingMetadata} from "next";
import {notFound} from "next/navigation";
import {defineQuery} from "next-sanity";
import {BlogIndex} from "@/components/templates/blog-index";
import {resolveSanityMetadata, sanityFetch} from "@/data/sanity/client";

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
