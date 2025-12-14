import {SanityImage} from "@/data/sanity/client";
import type {BlogPtBlock} from "../rich-text";

export default function ImageBlock(props: BlogPtBlock<"imagePtBlock">) {
	return (
		<figure className="my-8">
			<div className="overflow-hidden rounded-lg">
				<SanityImage data={{...props, _type: "image"}} sizes="634px" />
			</div>
			{props.caption && (
				<figcaption className="mt-3 text-center text-sm text-gray-600">
					{props.caption}
				</figcaption>
			)}
		</figure>
	);
}
