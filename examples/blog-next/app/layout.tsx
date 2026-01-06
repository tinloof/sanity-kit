import type {Metadata} from "next";

import "./globals.css";
import {disableDraftMode} from "@tinloof/sanity-next/actions/disable-draft-mode";
import ExitPreview from "@tinloof/sanity-next/components/exit-preview";
import {draftMode} from "next/headers";
import {defineQuery} from "next-sanity";
import {VisualEditing} from "next-sanity/visual-editing";
import {SanityLive, sanityFetch} from "@/data/sanity/client";

const GLOBAL_QUERY = defineQuery(`
  {
    "globalSeo": *[_type == "settings"][0].globalSeo {
      title,
      description,
      image,
    },
  }`);

export async function generateMetadata(): Promise<Metadata> {
	const {data} = await sanityFetch({
		query: GLOBAL_QUERY,
	});

	return {
		// openGraph: {
		//   images: !data?.globalSeo?.image
		//     ? undefined
		//     : getOgImages(data.globalSeo.image),
		//   ...(data?.globalSeo?.title ? {title: data?.globalSeo?.title} : {}),
		//   type: "website",
		// },
		title: data?.globalSeo?.title,
		description: data?.globalSeo?.description,
	};
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en-US">
			<body className={`antialiased`}>
				{children}
				{(await draftMode()).isEnabled && (
					<>
						<ExitPreview disableDraftMode={disableDraftMode} />
						<VisualEditing />
					</>
				)}
				<SanityLive refreshOnFocus={false} />
			</body>
		</html>
	);
}

export function generateStaticParams() {
	return ["/"];
}
