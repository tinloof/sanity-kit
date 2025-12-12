import type {
	PortableTextComponents,
	PortableTextProps,
} from "@portabletext/react";
import type {
	ArbitraryTypedObject,
	PortableTextBlock,
} from "@portabletext/types";

import {PortableText} from "@portabletext/react";
import {getPtComponentId} from "@tinloof/sanity-web";

import {cn} from "@/lib/utils";

import Table from "./pt-blocks/table";
import ImageBlock from "./pt-blocks/image";
import Code from "./pt-blocks/code";
import DynamicLink from "./dynamic-link";

export const RichText = ({
	value = [],
	className,
}: PortableTextProps<ArbitraryTypedObject | PortableTextBlock> & {
	className?: string;
	footer?: boolean;
}) => {
	const components: PortableTextComponents = {
		block: {
			h1: ({children, value: block}) => (
				<h1
					className="mb-4 mt-8 text-3xl font-bold"
					id={getPtComponentId(block as PortableTextBlock)}
				>
					{children}
				</h1>
			),
			h2: ({children, value: block}) => (
				<h2
					className="mb-4 mt-8 text-2xl font-bold"
					id={getPtComponentId(block as PortableTextBlock)}
				>
					{children}
				</h2>
			),
			h3: ({children, value: block}) => (
				<h3
					className="mb-4 mt-6 text-xl font-semibold"
					id={getPtComponentId(block as PortableTextBlock)}
				>
					{children}
				</h3>
			),
			h4: ({children, value: block}) => (
				<h4
					className="mb-3 mt-6 text-lg font-semibold"
					id={getPtComponentId(block as PortableTextBlock)}
				>
					{children}
				</h4>
			),
			h5: ({children, value: block}) => (
				<h5
					className="mb-3 mt-4 text-base font-semibold"
					id={getPtComponentId(block as PortableTextBlock)}
				>
					{children}
				</h5>
			),
			h6: ({children, value: block}) => (
				<h6
					className="mb-3 mt-4 text-sm font-semibold"
					id={getPtComponentId(block as PortableTextBlock)}
				>
					{children}
				</h6>
			),
			normal: ({children}) => <p className="leading-relaxed">{children}</p>,
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
			bullet: ({children}) => <li className="leading-relaxed">{children}</li>,
			number: ({children}) => <li className="leading-relaxed">{children}</li>,
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
			underline: ({children}) => <span className="underline">{children}</span>,
		},
		types: {
			imagePtBlock: ({value}) => <ImageBlock {...value} />,
			code: ({value}) => <Code {...value} />,
			table: ({value}) => <Table {...value} />,
		},
	};

	return (
		<div className={cn("space-y-5 *:first:mt-0 *:last:mb-0", className)}>
			<PortableText components={components} value={value} />
		</div>
	);
};
