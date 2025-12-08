import type { PagePayload } from "@/types";
import { SectionRenderer } from "./sections";

export interface PageProps {
	data: PagePayload | null;
}

export function Page({ data }: PageProps) {
	return (
		<div>
			{data?.sectionsBody?.map((section) => {
				return <SectionRenderer key={section._key} section={section} />;
			})}
		</div>
	);
}
