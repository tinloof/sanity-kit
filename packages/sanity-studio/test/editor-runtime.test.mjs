import assert from "node:assert/strict";
import {realpathSync} from "node:fs";
import {createRequire} from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);

test("Sanity and table merging share one Portable Text editor runtime", () => {
	const editor = realpathSync(require.resolve("@portabletext/editor"));
	for (const dependency of ["sanity", "@portabletext/plugin-table"]) {
		const dependencyRequire = createRequire(require.resolve(dependency));
		assert.equal(
			realpathSync(dependencyRequire.resolve("@portabletext/editor")),
			editor,
			`${dependency} must share the table entry point's editor context`,
		);
	}
});
