import {Page} from "@/components/pages/modular";

import {ResolvingMetadata} from "next";
import {notFound} from "next/navigation";
import {PageProps} from "@/types";
import {PAGE_QUERY, STATIC_PATHS_QUERY} from "@/data/sanity/queries";
import {
  resolveSanityMetadata,
  sanityFetch,
  sanityFetchMetadata,
  sanityFetchStaticParams,
} from "@/data/sanity/client";

export type DynamicRouteProps = PageProps<"...path", any>;

export async function generateMetadata(
  {params}: DynamicRouteProps,
  parentPromise: ResolvingMetadata,
) {
  const parent = await parentPromise;

  const {path} = await params;

  const {data} = await sanityFetchMetadata({
    query: PAGE_QUERY,
    params: {pathname: `/${path.join("/")}`},
  });

  if (!data) return notFound();

  return resolveSanityMetadata({...data, parent});
}

export default async function DynamicRoute({params}: DynamicRouteProps) {
  const {path} = await params;

  const {data} = await sanityFetch({
    query: PAGE_QUERY,
    params: {pathname: `/${path.join("/")}`},
  });

  if (!data) return notFound();

  return <Page data={data} />;
}

export async function generateStaticParams() {
  const {data: paths} = await sanityFetchStaticParams({
    query: STATIC_PATHS_QUERY,
  });

  if (!paths) return [];

  return paths?.map((path) => ({path}));
}
