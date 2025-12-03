import {Inter} from "next/font/google";

import {disableDraftMode} from "@tinloof/sanity-next/actions/disable-draft-mode";
import ExitPreviewClient from "@/components/exit-preview";
import {VisualEditing} from "next-sanity/visual-editing";
import {draftMode} from "next/headers";
import {Metadata} from "next";
import config from "@/config";

import {getOgImages} from "@tinloof/sanity-web";
import {client, sanityFetchMetadata, SanityLive} from "@/data/sanity/client";

import "@/styles/index.css";
import {GLOBAL_QUERY} from "@/data/sanity/queries";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const {data} = await sanityFetchMetadata({query: GLOBAL_QUERY});
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
