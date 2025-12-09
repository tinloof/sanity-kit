import {disableDraftMode} from "@tinloof/sanity-next/actions/disable-draft-mode";
import {getOgImages} from "@tinloof/sanity-web";
import type {Metadata} from "next";
import {Inter} from "next/font/google";
import {draftMode} from "next/headers";
import {VisualEditing} from "next-sanity/visual-editing";
import ExitPreviewClient from "@/components/exit-preview";
import config from "@/config";

import {loadGlobalData} from "@/data/sanity";
import {client} from "@/data/sanity/client";
import {SanityLive} from "@/data/sanity/live";

import "@/styles/index.css";

const sans = Inter({
	variable: "--font-sans",
	subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
	const data = await loadGlobalData();
	return {
		openGraph: {
			images: !data?.fallbackSEO?.ogImage
				? undefined
				: getOgImages({client, image: data.fallbackSEO.ogImage}),
			title: config.siteName,
		},
		title: {
			template: `%s | ${config.siteName}`,
			default: data?.fallbackSEO?.title || config.siteName,
		},
		description: data?.fallbackSEO?.description,
	};
}

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className={sans.variable}>
			<body>
				{children}
				{(await draftMode()).isEnabled && (
					<>
						<VisualEditing />
						<ExitPreviewClient disableDraftMode={disableDraftMode} />
					</>
				)}
				<SanityLive refreshOnFocus={false} />
			</body>
		</html>
	);
}
