import type {Metadata} from "next";
import {GLOBAL_QUERY} from "@examples/hello-world-i18n-studio/queries";
import {PageProps} from "@tinloof/sanity-next";

import "../globals.css";
import {sanityFetch, SanityLive} from "@/data/sanity/client";
import ExitPreview from "@tinloof/sanity-next/components/exit-preview";
import {disableDraftMode} from "@tinloof/sanity-next/actions/disable-draft-mode";
import {VisualEditing} from "next-sanity/visual-editing";
import {draftMode} from "next/headers";

type RootLayoutProps = PageProps<"locale">;

export async function generateMetadata(
  props: RootLayoutProps,
): Promise<Metadata> {
  const {locale} = await props.params;

  const {data} = await sanityFetch({query: GLOBAL_QUERY, params: {locale}});

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
  params,
}: Readonly<
  RootLayoutProps & {
    children: React.ReactNode;
  }
>) {
  const {locale} = await params;

  return (
    <html lang={locale}>
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
  return ["en", "fr"].map((locale) => ({
    locale,
  }));
}
