import type {Code as CodeProps} from "@examples/blog-studio/types";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import nord from "react-syntax-highlighter/dist/esm/styles/prism/nord";
import type {BlogPtBlock} from "../rich-text";

export default function Code({language = "bash", code}: BlogPtBlock<"code">) {
	if (!code) return null;

	return (
		<div className="mx-auto my-8">
			<SyntaxHighlighter
				customStyle={{
					paddingInline: "56px",
					paddingBlock: "40px",
					fontSize: "16px",
					borderRadius: "8px",
				}}
				language={language}
				lineProps={{style: {wordBreak: "break-all", whiteSpace: "pre-wrap"}}}
				style={nord}
				wrapLines={true}
			>
				{String(code)}
			</SyntaxHighlighter>
		</div>
	);
}
