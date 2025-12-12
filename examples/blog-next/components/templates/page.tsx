import type {
	HOME_QUERYResult,
	PAGE_QUERYResult,
} from "@examples/blog-studio/types";
import {notFound} from "next/navigation";
import {Sections} from "../sections";

export default function PageTemplate({
	data,
}: {
	data: HOME_QUERYResult | PAGE_QUERYResult;
}) {
	if (!data?._type || !["modular.page", "home"].includes(data._type))
		return notFound();

	return <Sections data={data?.sections ?? []} />;
}
