"use client";

import {BLOG_INDEX_QUERY} from "@examples/blog-studio/queries";
import type {BLOG_INDEX_QUERYResult} from "@examples/blog-studio/types";

import {InfiniteScroll} from "@tinloof/sanity-next/components/infinite-scroll";
import SanityImage from "@tinloof/sanity-next/components/sanity-image";
import {createClient} from "next-sanity";
import DynamicLink from "@/components/dynamic-link";
import {formatDate} from "@/utils/strings";
import {cn} from "@/utils/styles";

const client = createClient({
	projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
	dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
	apiVersion: "2025-10-10",
	useCdn: true,
	stega: {
		studioUrl: "http://localhost:3333",
	},
});

export function BlogIndex({
	entriesPerPage,
	initialData,
	tagParam,
}: {
	entriesPerPage: number;
	initialData: BLOG_INDEX_QUERYResult;
	tagParam?: string;
}) {
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
			<InfiniteScroll
				client={client}
				query={BLOG_INDEX_QUERY}
				initialData={initialData}
				pageSize={entriesPerPage}
				draftPageSize={500}
				params={{filterTag: tagParam ?? null}}
			>
				{({data, hasMore, ref}) => {
					return (
						<>
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
																<div
																	key={author._key}
																	className="size-6 rounded-full"
																>
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

							{/*<button onClick={loadMore}>Load more</button>*/}

							{hasMore ? (
								<>
									<div
										className="mb-3 py-9 pt-20 text-center text-m text-mid-grey"
										ref={ref}
									>
										Loading ...
									</div>
								</>
							) : null}
						</>
					);
				}}
			</InfiniteScroll>
		</div>
	);
}
