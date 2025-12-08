import Sections from "@/components/sections";
import type { PagePayload } from "@/types";

export interface PageProps {
	data: PagePayload | null;
}

export function Page({ data }: PageProps) {
	const { sectionsBody } = data ?? {};

	return <Sections sectionsData={sectionsBody} />;
}
