import type {BLOG_POST_QUERYResult} from "@examples/blog-studio/types";
import {SanityImage} from "@/data/sanity/client";
import DynamicLink from "../dynamic-link";
import {BlogRichText} from "../rich-text";

export default function BlogPostTemplate({
	data,
}: {
	data: BLOG_POST_QUERYResult;
}) {
	return (
		<article className="mx-auto max-w-3xl px-4 py-8">
			<h1 className="mb-6 text-4xl font-bold">{data?.title}</h1>
			{data?.authors && data.authors.length > 0 && (
				<div className="mb-6 flex flex-wrap gap-4">
					{data.authors.map((author) => (
						<div key={author._key} className="flex items-center gap-2">
							<div className="h-10 w-10 overflow-hidden rounded-full">
								<SanityImage
									data={author?.avatar}
									className="h-full w-full object-cover"
								/>
							</div>
							<p className="text-sm font-medium">{author.name}</p>
						</div>
					))}
				</div>
			)}
			{data?.tags && data.tags.length > 0 && (
				<div className="mb-8 flex flex-wrap gap-2">
					{data.tags.map((tag) => (
						<DynamicLink
							key={tag._key}
							href={`/blog/tag/${tag?.slug?.current}`}
							className="rounded-full bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
						>
							{tag?.title}
						</DynamicLink>
					))}
				</div>
			)}
			{data?.ptBody && (
				<div className="max-w-none space-y-4 first:mt-0 last:mb-0">
					<BlogRichText value={data.ptBody} />
				</div>
			)}
		</article>
	);
}
