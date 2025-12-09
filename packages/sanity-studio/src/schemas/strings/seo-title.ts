import {defineField} from "sanity";

import {InputWithCharacterCount} from "../../components";

export default defineField({
	components: {
		input: InputWithCharacterCount,
	},
	name: "title",
	options: {
		maxLength: 70,
		minLength: 15,
	},
	type: "string",
});
