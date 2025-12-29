import {defineQuery} from "next-sanity";
import {sanityFetch} from "@/data/sanity/client";
import BlogRoute, {generateMetadata} from "../../page";

export {generateMetadata};

export default BlogRoute;

const STATIC_BLOG_TAG_QUERY = defineQuery(
	`*[_type == "blog.tag"].slug.current`,
);

export async function generateStaticParams() {
	const {data} = await sanityFetch({
		query: STATIC_BLOG_TAG_QUERY,
		stega: false,
		perspective: "published",
	});

	const staticPaths =
		data?.map((tag) => ({tag})).filter((path) => Boolean(path.tag)) || [];

	return staticPaths;
}
