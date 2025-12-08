import type { ComponentType } from "react";
import {
	defineField,
	type StringInputProps,
	type StringSchemaType,
} from "sanity";

import { IconSelectComponent } from "../components/IconSelectComponent";

export default defineField({
	name: "icon",
	title: "Icon",
	type: "string",
	components: {
		input: IconSelectComponent as unknown as ComponentType<
			StringInputProps<StringSchemaType>
		>,
	},
});
