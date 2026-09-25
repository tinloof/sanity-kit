import assert from "node:assert/strict";
import test from "node:test";
import {redirectsSchema} from "../dist/index.js";

test("redirect query preservation is optional and defaults to false", () => {
	const field = redirectsSchema.of[0].fields.find(
		({name}) => name === "keepQueryParameters",
	);
	assert.ok(field);
	assert.equal(field.title, "Keep query parameters");
	assert.equal(field.type, "boolean");
	assert.equal(field.initialValue, false);
	assert.equal(field.validation, undefined);
});
