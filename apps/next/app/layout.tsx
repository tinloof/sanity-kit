import {Inter} from "next/font/google";

import {disableDraftMode} from "@/app/actions";
import ExitPreviewClient from "@/components/exit-preview";
import {VisualEditing} from "next-sanity/visual-editing";
import {SanityLive} from "@/data/sanity/live";
import {draftMode} from "next/headers";
import {Metadata} from "next";
import config from "@/config";

import "@/styles/index.css";
import {getOgImages} from "@tinloof/sanity-web";
import {loadGlobalData} from "@/data/sanity";
import {client} from "@/data/sanity/client";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const data = await loadGlobalData();
  return {
    openGraph: {
      images: !data?.fallbackSEO?.image
        ? undefined
        : getOgImages({client, image: data.fallbackSEO.image}),
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
