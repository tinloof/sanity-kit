"use client";

import DynamicLink from "@/components/dynamic-link";
import SanityImage from "@tinloof/sanity-next/components/sanity-image";
import {useInView} from "@/hooks/use-in-view";
import {useInfiniteScroll} from "@/hooks/use-infinite-scroll";
import {formatDate} from "@/utils/strings";
import {cn} from "@/utils/styles";
import {BLOG_INDEX_QUERY} from "@examples/blog-studio/queries";
import {BLOG_INDEX_QUERYResult} from "@examples/blog-studio/types";
import {useEffect} from "react";

export function BlogIndex({
	entriesPerPage,
	initialData,
	tagParam,
}: {
	entriesPerPage: number;
	initialData: BLOG_INDEX_QUERYResult;
	tagParam?: string;
}) {
	const {data, loadMore, pageNumber} = useInfiniteScroll(
		BLOG_INDEX_QUERY,
		initialData,
		"/api/load-more",
		{
			entriesPerPage,
			filterTag: tagParam ?? null,
		},
	);

	const pagesTotal = Math.ceil(
		(data?.entriesCount as number) / (data?.entriesPerPage as number),
	);

	const hasNextPage = pageNumber < pagesTotal;

	const {inView, ref} = useInView();

	useEffect(() => {
		if (inView && hasNextPage) {
			loadMore();
		}
	}, [hasNextPage, inView, loadMore]);

	return (
		<div className="mx-auto w-full px-6 md:px-global">
			<div className="flex flex-wrap items-center justify-start gap-4 pt-6 md:pt-9">
				<DynamicLink
					className={cn([
						"text-sm text-dark-grey",
						!tagParam && "text-dark underline",
					])}
					href="/blog"
					scroll={false}
				>
					All
				</DynamicLink>
				{initialData?.tags?.map((tag) => (
					<DynamicLink
						className={cn([
							"text-sm text-dark-grey",
							tagParam === tag.slug?.current && "text-dark underline",
						])}
						href={`/blog/tag/${tag.slug?.current}`}
						key={tag._id}
						scroll={false}
					>
						{tag.title}
					</DynamicLink>
				))}
			</div>

			<div className="grid gap-4 py-6 sm:grid-cols-2 md:grid-cols-3 md:py-9 lg:gap-9 xl:grid-cols-4">
				{data?.entries?.map(
					(post) =>
						post.pathname?.current && (
							<DynamicLink
								className="group/card rounded-card focus-visible:ring-2 focus-visible:ring-mid-grey"
								href={post?.pathname?.current}
								key={post?._id}
							>
								<div className="flex h-full flex-col gap-2.5 rounded-card bg-light-grey p-6">
									<time
										className="text-s text-mid-grey"
										dateTime={post?.publishedAt || ""}
									>
										{formatDate(post?.publishedAt || "")}
									</time>

									<div className="flex min-h-[82px] flex-col items-start gap-1">
										<h3 className="text-heading-3">{post?.title}</h3>
									</div>

									<div className="mt-auto flex items-center gap-3">
										{post?.authors?.map((author) =>
											author.avatar ? (
												<div key={author._key} className="size-6 rounded-full">
													<SanityImage
														aspectRatio="1/1"
														className="size-full rounded-full object-cover"
														data={author?.avatar}
													/>
												</div>
											) : null,
										)}
										{post?.authors && post.authors.length > 0 && (
											<h4 className="text-m-medium">
												{post.authors.map((a) => a.name).join(", ")}
											</h4>
										)}
									</div>
								</div>
							</DynamicLink>
						),
				)}
			</div>
			{hasNextPage && (
				<div
					className="mb-3 py-9 pt-20 text-center text-m text-mid-grey"
					ref={ref}
				>
					Loading ...
				</div>
			)}
		</div>
	);
}
