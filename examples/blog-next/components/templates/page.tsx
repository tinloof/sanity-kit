import type {
	HOME_QUERY_RESULT,
	PAGE_QUERY_RESULT,
} from "@examples/blog-studio/types";
import {notFound} from "next/navigation";
import {Sections} from "../sections";

export default function PageTemplate({
	data,
}: {
	data: HOME_QUERY_RESULT | PAGE_QUERY_RESULT;
}) {
	if (!data?._type || !["modular.page", "home"].includes(data._type))
		return notFound();

	return <Sections data={data?.sections ?? []} />;
}
