import {Page} from "@/components/Page";
import {loadPage} from "@/data/sanity";

export default async function IndexRoute() {
	const data = await loadPage("/");

	return <Page data={data} />;
}
