import type {PagePayload} from "@/types";

export interface PageProps {
	data: PagePayload | null;
}

export function Page({data}: PageProps) {
	const {title} = data ?? {};

	return (
		<div className="w-screen h-screen flex justify-center items-center">
			<h1>{title}</h1>
		</div>
	);
}
