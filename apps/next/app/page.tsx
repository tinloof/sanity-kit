import {Page} from "@/components/pages/modular";
import {
  resolveSanityMetadata,
  sanityFetch,
  sanityFetchMetadata,
} from "@/data/sanity/client";
import {PAGE_QUERY} from "@/data/sanity/queries";
import {ResolvingMetadata} from "next";
import {notFound} from "next/navigation";

export async function generateMetadata(
  props,
  parentPromise: ResolvingMetadata,
) {
  const parent = await parentPromise;

  const {data} = await sanityFetchMetadata({
    query: PAGE_QUERY,
    params: {pathname: "/"},
  });

  if (!data) return notFound();

  return resolveSanityMetadata({...data, parent});
}

export default async function IndexRoute() {
  const {data} = await sanityFetch({
    query: PAGE_QUERY,
    params: {pathname: "/"},
  });

  if (!data) return notFound();

  return <Page data={data} />;
}
