import {Inter} from "next/font/google";

import {disableDraftMode} from "@/app/actions";
import ExitPreviewClient from "@/components/exit-preview";
import {VisualEditing} from "next-sanity/visual-editing";
import {SanityLive} from "@/data/sanity/live";
import {draftMode} from "next/headers";
import {Metadata} from "next";
import config from "@/config";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${config.siteName}`,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={sans.variable}>
      <body>
        {children}
        <ExitPreviewClient disableDraftMode={disableDraftMode} />
        {(await draftMode()).isEnabled && (
          <>
            <VisualEditing />
            <SanityLive refreshOnFocus={false} />
          </>
        )}
      </body>
    </html>
  );
}
