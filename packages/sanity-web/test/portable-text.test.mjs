import assert from "node:assert/strict";
import test from "node:test";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {PortableText} from "../dist/components/portable-text.mjs";

const block = (key, text, extra = {}) => ({
	_type: "block",
	_key: key,
	style: "normal",
	markDefs: [],
	children: [{_type: "span", _key: `${key}-span`, text, marks: []}],
	...extra,
});
const render = (value, components) =>
	renderToStaticMarkup(createElement(PortableText, {value, components}));

test("headings preserve stable anchors and inline marks", () => {
	const heading = block("heading", "Hello World", {style: "h2"});
	const paragraph = block("paragraph", "Important");
	paragraph.children[0].marks = ["strong"];
	assert.equal(
		render([heading, paragraph]),
		'<h2 id="hello-world">Hello World</h2><p><strong>Important</strong></p>',
	);
});

test("custom blocks and heading components keep their content", () => {
	const html = render(
		[
			block("heading", "Custom Heading", {style: "h3"}),
			{_type: "callout", _key: "custom", text: "A note"},
		],
		{
			block: {
				h3: ({children}) =>
					createElement("h3", {className: "custom"}, children),
			},
			types: {callout: ({value}) => createElement("aside", null, value.text)},
		},
	);
	assert.equal(
		html,
		'<h3 class="custom" id="custom-heading">Custom Heading</h3><aside>A note</aside>',
	);
});

test("ordinary ordered lists preserve order and empty content renders nothing", () => {
	const html = render([
		block("first", "First", {listItem: "number", level: 1}),
		block("second", "Second", {listItem: "number", level: 1}),
	]);
	assert.equal(html, "<ol><li>First</li><li>Second</li></ol>");
	assert.equal(render([]), "");
});

// Portable Text 8 preserves authored depth and continues the parent list.
test("skipped levels produce nested lists and continue top-level numbering", () => {
	const html = render([
		block("deep", "Deep", {listItem: "number", level: 3}),
		block("top", "Top", {listItem: "number", level: 1}),
	]);
	assert.equal(
		html,
		"<ol><li><ol><li><ol><li>Deep</li></ol></li></ol></li><li>Top</li></ol>",
	);
});
