import { toPlainText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

import { truncate } from "../strings";
import { slugify } from "../urls";

export const getPtComponentId = (blocks: PortableTextBlock) => {
	return truncate(slugify(toPlainText(blocks)), 200);
};
