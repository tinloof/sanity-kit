import {Page} from "@/components/Page";
import {loadPage} from "@/data/sanity";

export default async function IndexRoute({
	params,
}: {
	params: Promise<{locale: string}>;
}) {
	const data = await loadPage("/", (await params).locale);

	return <Page data={data} />;
}
