import {ResolvingMetadata} from "next";
import {notFound} from "next/navigation";
import {PageProps} from "@tinloof/sanity-next";
import {HOME_QUERY} from "@examples/hello-world-i18n-studio/queries";
import {resolveSanityMetadata, sanityFetch} from "@/data/sanity/client";
import PageTemplate from "@/components/templates/page";

type IndexRouteProps = PageProps<"locale">;

export async function generateMetadata(
  props: IndexRouteProps,
  parent: ResolvingMetadata,
) {
  const {locale} = await props.params;

  const {data} = await sanityFetch({
    params: {locale},
    query: HOME_QUERY,
  });

  if (!data) return notFound();

  return resolveSanityMetadata({...data, parent: await parent});
}

export default async function HomePage(props: IndexRouteProps) {
  const {locale} = await props.params;

  const {data} = await sanityFetch({
    params: {locale},
    query: HOME_QUERY,
  });

  if (!data) return notFound();

  return <PageTemplate data={data} />;
}
