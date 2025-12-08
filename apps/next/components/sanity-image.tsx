import type { SanityImageProps } from "@tinloof/sanity-web";

import { SanityImage as SanityImageBase } from "@tinloof/sanity-web";

import config from "@/config";

export function SanityImage({
	data,
	...props
}: Omit<SanityImageProps, "config">) {
	return (
		<SanityImageBase
			data={data}
			config={{
				dataset: config.sanity.dataset,
				projectId: config.sanity.projectId,
			}}
			{...props}
		/>
	);
}
