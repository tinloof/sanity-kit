import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {resolve} from "node:path";

// Optionally test a separate installation without changing the workspace.
const require = createRequire(
	process.argv[2]
		? resolve(process.argv[2])
		: new URL("../packages/document-i18n/package.json", import.meta.url),
);
const {createSchema} = require("sanity");
const {validateDocument} = createRequire(require.resolve("sanity"))(
	"@sanity/validation",
);

let failures = 0;
for (const explicitValidation of [false, true]) {
	for (const alias of [false, true]) {
		for (const custom of [true, false, undefined]) {
			for (const defaultResult of custom === undefined
				? [true, false]
				: [!custom]) {
				let customCalls = 0;
				let defaultCalls = 0;
				const options =
					custom === undefined
						? {}
						: {
								isUnique: (slug, context) => {
									customCalls++;
									assert.equal(slug, "/shared");
									assert.equal(context.document.locale, "fr");
									return custom;
								},
							};
				const schema = createSchema({
					name: "slug-matrix",
					types: [
						...(alias ? [{name: "localizedPath", type: "slug", options}] : []),
						{
							name: "page",
							type: "document",
							fields: [
								{name: "locale", type: "string"},
								{
									name: "pathname",
									type: alias ? "localizedPath" : "slug",
									...(alias ? {} : {options}),
									...(explicitValidation ? {validation: (rule) => rule} : {}),
								},
							],
						},
					],
				});
				const client = {
					withConfig() {
						return this;
					},
					async fetch() {
						defaultCalls++;
						return defaultResult;
					},
				};
				const result = await validateDocument({
					schema,
					client,
					environment: "studio",
					document: {
						_id: "page-fr",
						_type: "page",
						locale: "fr",
						pathname: {_type: "slug", current: "/shared"},
					},
				});
				const markers = Array.isArray(result) ? result : result.markers;
				const expectedUnique = custom ?? defaultResult;
				const passed =
					customCalls === (custom === undefined ? 0 : 1) &&
					defaultCalls === (custom === undefined ? 1 : 0) &&
					markers.length === (expectedUnique ? 0 : 1);
				if (!passed) failures++;
				console.log(
					JSON.stringify({
						explicitValidation,
						alias,
						custom: custom ?? "absent",
						defaultResult,
						customCalls,
						defaultCalls,
						markers,
						passed,
					}),
				);
			}
		}
	}
}
assert.equal(failures, 0, `${failures} slug compatibility scenarios failed`);
