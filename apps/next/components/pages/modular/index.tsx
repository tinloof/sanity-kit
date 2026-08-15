import Sections from "@/components/sections";
import type {PAGE_QUERY_RESULT} from "@/sanity.types";

export interface PageProps {
	data: PAGE_QUERY_RESULT;
}

export function Page({data}: PageProps) {
	// PAGE_QUERY matches on pathname, so its result is a union across every
	// document type that has one. Only modular pages carry sections — and the
	// field is `sections`; `sectionsBody` is its schema type, not its name.
	const sections = data?._type === "modular.page" ? data.sections : undefined;

	return <Sections sectionsData={sections} />;
}
