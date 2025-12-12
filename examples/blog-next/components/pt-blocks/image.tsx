import {SanityImage} from "@/data/sanity/client";
import {BlogPost} from "@examples/blog-studio/types";

export default function ImageBlock(
	props: Extract<NonNullable<BlogPost["ptBody"]>[0], {_type: "imagePtBlock"}>,
) {
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
