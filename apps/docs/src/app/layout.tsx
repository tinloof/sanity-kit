import {RootProvider} from "fumadocs-ui/provider/next";
import localFont from "next/font/local";
import "./global.css";
import {Inter} from "next/font/google";
import {cn} from "@/lib/cn";

const oracle = localFont({
	src: [
		{
			path: "./fonts/abc-oracle/ABCOracle-Book.woff2",
			style: "normal",
			weight: "400",
		},
		{
			path: "./fonts/abc-oracle/ABCOracle-Regular.woff2",
			style: "medium",
			weight: "500",
		},
	],
});

const oracleMono = localFont({
	src: "./fonts/abc-oracle-mono/ABCOracleMono-Regular.otf",
	variable: "--font-mono",
});

export default function Layout({children}: LayoutProps<"/">) {
	return (
		<html
			className={cn(oracle.className, oracleMono.variable, "overscroll-none")}
			lang="en"
			suppressHydrationWarning
		>
			<body className="flex flex-col min-h-screen">
				<RootProvider>{children}</RootProvider>
			</body>
		</html>
	);
}
