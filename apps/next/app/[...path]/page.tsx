import {Page} from "@/components/pages/modular";
import {loadPage} from "@/data/sanity";
import {notFound} from "next/navigation";

export default async function DynamicRoute({
  params,
}: {
  params: Promise<{path: string[]}>;
}) {
  const pathname = `/${(await params).path.join("/")}`;
  const data = await loadPage(pathname);

  if (!data) return notFound();

  return <Page data={data} />;
}
