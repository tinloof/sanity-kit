import assert from "node:assert/strict";
import {createRequire} from "node:module";
import test from "node:test";
import {definePathname} from "../dist/index.js";

const require = createRequire(
	process.env.SANITY_TEST_PACKAGE || import.meta.url,
);
const sanity = require("sanity");
const {createSchema} = sanity;
let validateDocument;
try {
	validateDocument = createRequire(require.resolve("sanity"))(
		"@sanity/validation",
	).validateDocument;
} catch (error) {
	if (error.code !== "MODULE_NOT_FOUND") throw error;
	// Older Sanity releases expose the workspace-based validation API.
	globalThis.window ??= {setTimeout, clearTimeout};
	validateDocument = ({schema, client, document}) =>
		sanity.validateDocument({
			document,
			workspace: {
				schema,
				getClient: () => client,
				i18n: {t: (key) => key, loadNamespaces: async () => {}},
			},
			getClient: () => client,
		});
}

async function validate(
	field,
	{locale = "fr", value = "/shared", existing = []} = {},
) {
	const queries = [];
	const schema = createSchema({
		name: "pathname-test",
		types: [
			{
				name: "page",
				type: "document",
				fields: [{name: "locale", type: "string"}, field],
			},
		],
	});
	const client = {
		config() {
			return {};
		},
		withConfig() {
			return this;
		},
		async fetch(query, params) {
			queries.push({query, params});
			// Both the locale-aware helper query and the upstream fallback query.
			const matches = existing.filter(
				(item) =>
					item._id !== params.published &&
					item._id !== params.draft &&
					item.path === params.slug &&
					(!("locale" in params) || item.locale === params.locale),
			);
			return "locale" in params ? matches : matches.length === 0;
		},
	};
	const document = {_id: "drafts.current", _type: "page", locale};
	if (value !== undefined)
		document[field.name] = {_type: "slug", current: value};
	const result = await validateDocument({schema, client, document});
	return {markers: Array.isArray(result) ? result : result.markers, queries};
}

test("translations can share a pathname without invoking default uniqueness", async () => {
	const {markers, queries} = await validate(definePathname(), {
		existing: [{_id: "english", locale: "en", path: "/shared"}],
	});
	assert.deepEqual(markers, []);
	assert.equal(queries.length, 1);
	assert.equal(queries[0].params.locale, "fr");
});

test("same-locale duplicate pathnames are rejected", async () => {
	const {markers, queries} = await validate(definePathname(), {
		existing: [{_id: "french", locale: "fr", path: "/shared"}],
	});
	assert.equal(markers.length, 1);
	assert.equal(queries[0].params.locale, "fr");
});

for (const result of [true, false]) {
	test(`caller uniqueness callback returning ${result} remains authoritative`, async () => {
		let calls = 0;
		const {markers, queries} = await validate(
			definePathname({
				options: {
					isUnique: async (slug, context) => {
						calls++;
						assert.equal(slug, "/shared");
						assert.equal(context.document.locale, "fr");
						return result;
					},
				},
			}),
		);
		assert.equal(calls, 1);
		assert.equal(queries.length, 0);
		assert.equal(markers.length, result ? 0 : 1);
	});
}

test("caller validation functions are preserved and still run", async () => {
	const validation = (rule) =>
		rule.custom(() => "Caller policy rejected this path");
	const field = definePathname({validation});
	assert.equal(field.validation, validation);
	const {markers} = await validate(field);
	assert.ok(
		markers.some(
			(marker) => marker.message === "Caller policy rejected this path",
		),
	);
});

test("caller validation returning multiple rules retains every rule", async () => {
	const validation = (rule) => [
		rule.custom(() => "First policy"),
		rule.custom(() => "Second policy"),
	];
	const field = definePathname({validation});
	assert.equal(field.validation, validation);
	const {markers} = await validate(field);
	assert.ok(markers.some((marker) => marker.message === "First policy"));
	assert.ok(markers.some((marker) => marker.message === "Second policy"));
});

test("absent pathname stays optional unless the caller requires it", async () => {
	for (const required of [false, true]) {
		const field = definePathname(
			required ? {validation: (rule) => rule.required()} : {},
		);
		const schema = createSchema({
			name: "optional-test",
			types: [{name: "page", type: "document", fields: [field]}],
		});
		const result = await validateDocument({
			schema,
			client: {
				config() {
					return {};
				},
				withConfig() {
					return this;
				},
				async fetch() {
					throw new Error("Missing slugs must not query uniqueness");
				},
			},
			document: {_id: "current", _type: "page"},
		});
		const markers = Array.isArray(result) ? result : result.markers;
		assert.equal(markers.length > 0, required);
		assert.ok(
			!markers.some((marker) => /Missing slugs|Exception/.test(marker.message)),
		);
	}
});

test("callback failures remain validation failures", async () => {
	const {markers, queries} = await validate(
		definePathname({
			options: {
				isUnique: async () => {
					throw new Error("Uniqueness service unavailable");
				},
			},
		}),
	);
	assert.equal(queries.length, 0);
	assert.ok(
		markers.some((marker) =>
			marker.message.includes("Uniqueness service unavailable"),
		),
	);
});

test("helper preserves caller configuration without mutating it", () => {
	const validation = [];
	const options = Object.freeze({source: "title"});
	const input = Object.freeze({name: "customPath", options, validation});
	const field = definePathname(input);
	assert.equal(field.name, "customPath");
	assert.equal(field.options.source, "title");
	assert.equal(field.validation, validation);
	assert.equal(input.options, options);
});
