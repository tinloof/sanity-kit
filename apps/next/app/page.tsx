import {Page} from "@/components/pages/modular";
import {loadPage} from "@/data/sanity";
import {notFound} from "next/navigation";

export default async function IndexRoute() {
  const data = await loadPage("/");

  if (!data) return notFound();

  return <Page data={data} />;
}
