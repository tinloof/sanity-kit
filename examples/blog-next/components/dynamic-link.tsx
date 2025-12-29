import {isExternalUrl} from "@tinloof/sanity-web";
import Link from "next/link";
import {type ComponentProps, forwardRef} from "react";

export type LinkProps = ComponentProps<"a"> & {
	_key?: string;
	href?: string;
	label?: string;
	scroll?: boolean;
};

export default forwardRef<
	HTMLAnchorElement,
	React.PropsWithChildren<LinkProps>
>(function DynamicLink(props, ref) {
	const {href, renderNode, markType, markKey, ...rest} = props as LinkProps & {
		renderNode?: unknown;
		markType?: unknown;
		markKey?: unknown;
	};
	const hrefNullishChecked = href ?? "/";
	const isExternal = isExternalUrl(hrefNullishChecked);

	if (isExternal) {
		return (
			<a
				{...rest}
				href={hrefNullishChecked}
				ref={ref}
				rel="noopener noreferrer"
				tabIndex={0}
				target="_blank"
			>
				{props.children}
			</a>
		);
	}

	return (
		<Link
			{...rest}
			href={hrefNullishChecked}
			prefetch
			ref={ref}
			scroll={props.scroll ?? true}
			tabIndex={0}
		>
			{props.children}
		</Link>
	);
});
