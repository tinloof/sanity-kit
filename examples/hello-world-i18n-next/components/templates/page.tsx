import type {
	HOME_QUERY_RESULT,
	PAGE_QUERY_RESULT,
} from "@examples/hello-world-i18n-studio/types";
import {notFound} from "next/navigation";
import {Sections} from "../sections";

export default function PageTemplate({
	data,
}: {
	data: HOME_QUERY_RESULT | PAGE_QUERY_RESULT;
}) {
	if (!data?._type || !["modular.page", "home"].includes(data._type))
		return notFound();

	return <Sections sharedProps={{locale: "en"}} data={data?.sections ?? []} />;
}
