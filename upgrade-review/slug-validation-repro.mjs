import assert from "node:assert/strict";
import {createRequire} from "node:module";

const require = createRequire(
	new URL("../packages/document-i18n/package.json", import.meta.url),
);
const {createSchema} = require("sanity");
const {validateDocument} = createRequire(require.resolve("sanity"))(
	"@sanity/validation",
);
let customValidatorCalls = 0;
const queries = [];
const schema = createSchema({
	name: "slug-probe",
	types: [
		{
			name: "page",
			type: "document",
			fields: [
				{
					name: "pathname",
					type: "slug",
					options: {
						isUnique: () => {
							customValidatorCalls++;
							return true;
						},
					},
				},
			],
		},
	],
});
const client = {
	withConfig() {
		return this;
	},
	async fetch(query) {
		queries.push(query);
		return false;
	},
};
const result = await validateDocument({
	document: {
		_id: "page-fr",
		_type: "page",
		pathname: {_type: "slug", current: "/shared"},
	},
	schema,
	client,
});
console.log(JSON.stringify({customValidatorCalls, queries, result}, null, 2));
assert.ok(
	customValidatorCalls > 0,
	"Sanity must call the field's custom isUnique validator",
);
assert.equal(
	queries.length,
	0,
	"A custom isUnique validator must replace the default query",
);
