import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {after, test} from "node:test";

// Reuse the workspace's existing DOM test dependency without adding a package.
const {JSDOM} = createRequire(
	new URL("../../document-i18n/package.json", import.meta.url),
)("jsdom");
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
	url: "http://localhost",
	pretendToBeVisual: true,
});
for (const name of [
	"window",
	"document",
	"HTMLElement",
	"HTMLInputElement",
	"Event",
	"MouseEvent",
	"getComputedStyle",
]) {
	globalThis[name] = dom.window[name];
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
after(() => dom.window.close());

const {createElement: h, act} = await import("react");
const {createRoot} = await import("react-dom/client");
const {ThemeProvider} = await import("@sanity/ui");
const {defaultTheme} = await import("sanity");
const {redirectsSchema} = await import("../dist/index.js");
const Input = redirectsSchema.components.input;

function entries(count) {
	return Array.from({length: count}, (_, index) => ({
		kind: "item",
		key: `redirect-${index}`,
		index,
		open: false,
		item: {
			value: {
				_key: `redirect-${index}`,
				source: `/source-${index}`,
				destination: `/destination-${index}`,
				permanent: index % 2 === 0,
			},
			focused: false,
			validation: [{level: "warning", message: "Preserve validation"}],
		},
	}));
}

async function mount(members, overrides = {}) {
	const container = document.createElement("div");
	document.body.append(container);
	const root = createRoot(container);
	let rendered;
	const moves = [];
	let props = {
		members,
		value: members.filter((m) => m.kind === "item").map((m) => m.item.value),
		focusPath: [],
		readOnly: false,
		onItemMove: (event) => moves.push(event),
		onItemAppend: () => {},
		onItemPrepend: () => {},
		onInsert: () => {},
		onItemRemove: () => {},
		renderDefault: (input) => {
			rendered = input;
			return null;
		},
		...overrides,
	};
	async function update(next = {}) {
		props = {...props, ...next};
		await act(async () =>
			root.render(h(ThemeProvider, {theme: defaultTheme}, h(Input, props))),
		);
	}
	await update();
	return {
		container,
		moves,
		get rendered() {
			return rendered;
		},
		get props() {
			return props;
		},
		update,
		button: (name) =>
			container.querySelector(`button[aria-label="${name} page of redirects"]`),
		async page(name) {
			await act(async () => this.button(name).click());
		},
		async search(value) {
			const input = container.querySelector("input");
			await act(async () => {
				Object.getOwnPropertyDescriptor(
					HTMLInputElement.prototype,
					"value",
				).set.call(input, value);
				input.dispatchEvent(new Event("input", {bubbles: true}));
			});
		},
		async close() {
			await act(async () => root.unmount());
			container.remove();
		},
	};
}

async function withInput(members, run, overrides) {
	const input = await mount(members, overrides);
	try {
		await run(input);
	} finally {
		await input.close();
	}
}

const text = (input) => input.container.textContent;

test("1,579 redirects page in original groups of 50 with accurate boundaries", async () => {
	const members = entries(1579);
	await withInput(members, async (input) => {
		assert.deepEqual(input.rendered.members, members.slice(0, 50));
		assert.match(text(input), /Showing 1-50 of 1579 redirects/);
		assert.match(text(input), /Page 1 of 32/);
		assert.equal(input.button("Previous").disabled, true);
		for (let page = 1; page < 32; page++) await input.page("Next");
		assert.deepEqual(input.rendered.members, members.slice(1550));
		assert.match(text(input), /Showing 1551-1579 of 1579 redirects/);
		assert.equal(input.button("Next").disabled, true);
		await input.page("Previous");
		assert.deepEqual(input.rendered.members, members.slice(1500, 1550));
	});
});

test("search scans all entries and resets page for source, destination, and status", async () => {
	const members = entries(1579);
	await withInput(members, async (input) => {
		await input.page("Next");
		await input.search("/SOURCE-1578");
		assert.deepEqual(input.rendered.members, [members[1578]]);
		assert.match(text(input), /Showing 1-1 of 1 redirect \(1579 total\)/);
		assert.match(text(input), /Page 1 of 1/);
		await input.search("/destination-1567");
		assert.deepEqual(input.rendered.members, [members[1567]]);
		for (const [query, permanent] of [
			["permanent", true],
			["true", true],
			["temporary", false],
			["false", false],
		]) {
			await input.search(query);
			assert.equal(input.rendered.members.length, 50);
			assert.ok(
				input.rendered.members.every(
					(m) => m.item.value.permanent === permanent,
				),
			);
		}
		await input.search("no-match");
		assert.deepEqual(input.rendered.members, []);
		assert.match(text(input), /No redirects match your search/);
		assert.equal(input.button("Next").disabled, true);
		await input.search("");
		assert.deepEqual(input.rendered.members, members.slice(0, 50));
	});
});

test("empty arrays and deletion of the last page clamp without reviving stale pages", async () => {
	await withInput(entries(51), async (input) => {
		await input.page("Next");
		await input.update({members: input.props.members.slice(0, 50)});
		assert.match(text(input), /Page 1 of 1/);
		assert.equal(input.rendered.members.length, 50);
		await input.update({members: entries(51)});
		assert.match(text(input), /Page 1 of 2/);
		await input.update({members: []});
		assert.match(text(input), /No redirects/);
		assert.equal(input.button("Previous").disabled, true);
		assert.equal(input.button("Next").disabled, true);
	});
});

test("errors, member identities, values, validation and callbacks survive paging/search", async () => {
	const members = entries(101);
	const error = {
		kind: "error",
		key: "broken",
		index: 101,
		error: {type: "INVALID_ITEM_TYPE"},
	};
	members.push(error);
	await withInput(members, async (input) => {
		await input.page("Next");
		assert.equal(input.rendered.members[0], members[50]);
		assert.equal(input.rendered.members.at(-1), error);
		assert.equal(input.rendered.value, input.props.value);
		for (const callback of [
			"onItemAppend",
			"onItemPrepend",
			"onInsert",
			"onItemRemove",
		]) {
			assert.equal(input.rendered[callback], input.props[callback]);
		}
		await input.search("no-match");
		assert.deepEqual(input.rendered.members, [error]);
	});
});

test("initial open and keyed/numeric focused entries navigate to their own page", async () => {
	for (const mode of ["open", "focused", "keyed", "numeric"]) {
		const members = entries(101);
		if (mode === "open") members[100].open = true;
		if (mode === "focused") members[100].item.focused = true;
		const focusPath =
			mode === "keyed"
				? [{_key: members[100].key}, "source"]
				: mode === "numeric"
					? [100, "source"]
					: [];
		await withInput(
			members,
			async (input) => {
				assert.match(text(input), /Page 3 of 3/);
				assert.deepEqual(input.rendered.members, [members[100]]);
			},
			{focusPath},
		);
	}
});

test("new blank entries remain reachable from a filtered page and after closing", async () => {
	const members = entries(100);
	await withInput(members, async (input) => {
		await input.search("permanent");
		const added = {...entries(101)[100], open: true};
		added.item.value = {_key: added.key};
		await input.update({
			members: [...members, added],
			focusPath: [{_key: added.key}, "source"],
		});
		assert.equal(input.container.querySelector("input").value, "");
		assert.match(text(input), /Page 3 of 3/);
		assert.deepEqual(input.rendered.members, [added]);
		const closed = {...added, open: false};
		await input.update({members: [...members, closed], focusPath: []});
		assert.deepEqual(input.rendered.members, [closed]);
	});
});

test("active entries stay mounted across navigation and searches without miscounting results", async () => {
	const members = entries(101);
	members[0].open = true;
	await withInput(members, async (input) => {
		await input.page("Next");
		assert.deepEqual(input.rendered.members, [
			members[0],
			...members.slice(50, 100),
		]);
		assert.match(
			text(input),
			/1 active redirect kept visible outside these results/,
		);
		await input.search("/source-100");
		assert.deepEqual(input.rendered.members, [members[0], members[100]]);
		assert.match(text(input), /Showing 1-1 of 1 redirect \(101 total\)/);
	});
});

test("moves translate visible positions after pagination, filtering and retained errors", async () => {
	const members = entries(101);
	const error = {
		kind: "error",
		key: "broken",
		index: 101,
		error: {type: "INVALID_ITEM_TYPE"},
	};
	await withInput([...members, error], async (input) => {
		await input.page("Next");
		input.rendered.onItemMove({fromIndex: 0, toIndex: 49});
		assert.deepEqual(input.moves.pop(), {fromIndex: 50, toIndex: 99});
		await input.search("permanent");
		input.rendered.onItemMove({fromIndex: 2, toIndex: 1});
		assert.deepEqual(input.moves.pop(), {fromIndex: 4, toIndex: 2});
		input.rendered.onItemMove({fromIndex: 50, toIndex: 1});
		assert.deepEqual(input.moves.pop(), {fromIndex: 101, toIndex: 2});
		input.rendered.onItemMove({fromIndex: 999, toIndex: 1});
		assert.deepEqual(input.moves, []);
	});
});

test("read-only forwards editing restrictions while search and paging remain usable", async () => {
	await withInput(
		entries(101),
		async (input) => {
			assert.equal(input.rendered.readOnly, true);
			await input.page("Next");
			assert.match(text(input), /Page 2 of 3/);
			input.rendered.onItemMove({fromIndex: 0, toIndex: 1});
			assert.deepEqual(input.moves, []);
			await input.search("/source-100");
			assert.equal(input.rendered.members[0].index, 100);
			assert.equal(input.rendered.readOnly, true);
		},
		{readOnly: true},
	);
});
