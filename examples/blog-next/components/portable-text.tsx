import type {BLOG_POST_QUERYResult} from "@examples/blog-studio/types";
import {PortableText} from "@tinloof/sanity-web/components/portable-text";
import type {
	ExtractPtBlock,
	ExtractPtBlockType,
} from "@tinloof/sanity-web/utils";

import DynamicLink from "./dynamic-link";
import Code from "./pt-blocks/code";
import ImageBlock from "./pt-blocks/image";
import Table from "./pt-blocks/table";

type PTBody = NonNullable<NonNullable<BLOG_POST_QUERYResult>["ptBody"]>;

export type BlogPtBlock<TType extends ExtractPtBlockType<PTBody>> =
	ExtractPtBlock<PTBody, TType>;

export const BlogPortableText = ({value = []}: {value?: PTBody}) => {
	return (
		<PortableText<PTBody>
			value={value ?? []}
			components={{
				block: {
					h2: ({children}) => (
						<h2 className="mb-4 mt-8 text-2xl font-bold">{children}</h2>
					),
					h3: ({children}) => (
						<h3 className="mb-4 mt-6 text-xl font-semibold">{children}</h3>
					),
					h4: ({children}) => (
						<h4 className="mb-3 mt-6 text-lg font-semibold">{children}</h4>
					),
					normal: ({children}) => <p className="leading-relaxed">{children}</p>,
					blockquote: ({children}) => (
						<blockquote className="border-l-4 pl-4 italic">
							{children}
						</blockquote>
					),
				},
				list: {
					bullet: ({children}) => (
						<ul className="list-disc space-y-2 pl-6 [&_ul]:list-[circle] [&_ul]:pl-6 [&_ul_ul]:list-[square]">
							{children}
						</ul>
					),
					number: ({children}) => (
						<ol className="list-decimal space-y-2 pl-6 [&_ol]:list-[lower-alpha] [&_ol]:pl-6 [&_ol_ol]:list-[lower-roman]">
							{children}
						</ol>
					),
				},
				listItem: {
					bullet: ({children}) => (
						<li className="leading-relaxed">{children}</li>
					),
					number: ({children}) => (
						<li className="leading-relaxed">{children}</li>
					),
				},
				marks: {
					link: (props) => (
						<DynamicLink className="underline underline-offset-3" {...props}>
							{props.children}
						</DynamicLink>
					),
					code: (props) => {
						return (
							<code className="bg-black text-white px-1 py-0.5 font-mono">
								{props.children}
							</code>
						);
					},
					em: ({children}) => <span className="italic">{children}</span>,
					del: ({children}) => <span className="line-through">{children}</span>,
					strong: ({children}) => (
						<strong className="font-semibold">{children}</strong>
					),
					underline: ({children}) => (
						<span className="underline">{children}</span>
					),
				},
				types: {
					imagePtBlock: ({value}) => <ImageBlock {...value} />,
					code: ({value}) => <Code {...value} />,
					table: ({value}) => <Table {...value} />,
				},
			}}
		/>
	);
};
