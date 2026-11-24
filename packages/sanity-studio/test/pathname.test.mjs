import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { definePathname } from "../dist/index.js";

const require = createRequire(
  process.env.SANITY_TEST_PACKAGE || import.meta.url,
);
const sanity = require("sanity");
const { createSchema } = sanity;
const { parse, evaluate } = createRequire(require.resolve("sanity"))("groq-js");
let validateDocument;
try {
  validateDocument = createRequire(require.resolve("sanity"))(
    "@sanity/validation",
  ).validateDocument;
} catch (error) {
  if (error.code !== "MODULE_NOT_FOUND") throw error;
  // Older Sanity releases expose the workspace-based validation API.
  globalThis.window ??= { setTimeout, clearTimeout };
  validateDocument = ({ schema, client, document }) =>
    sanity.validateDocument({
      document,
      workspace: {
        schema,
        getClient: () => client,
        i18n: { t: (key) => key, loadNamespaces: async () => {} },
      },
      getClient: () => client,
    });
}

async function validate(
  field,
  {
    locale = "fr",
    value = "/shared",
    existing = [],
    otherFields = [],
    documentType = "page",
  } = {},
) {
  const queries = [];
  const schema = createSchema({
    name: "pathname-test",
    types: [
      {
        name: "page",
        type: "document",
        fields: [{ name: "locale", type: "string" }, field],
      },
      ...otherFields.map((field, index) => ({
        name: `other${index}`,
        type: "document",
        fields: [field],
      })),
    ],
  });
  const client = {
    config() {
      return { projectId: "test-project", dataset: "test-dataset" };
    },
    withConfig() {
      return this;
    },
    async request({ uri }) {
      assert.equal(uri, "/users/me");
      return null;
    },
    async fetch(query, params) {
      queries.push({ query, params });
      const dataset = existing.map(
        ({ path, fieldName = field.name, ...item }) => ({
          _type: "page",
          ...item,
          [fieldName]: { current: path },
        }),
      );
      // Evaluate the actual GROQ, including locale, exclusions, and pagination.
      return (await evaluate(parse(query), { dataset, params })).get();
    },
  };
  const document = { _id: "drafts.current", _type: documentType, locale };
  if (value !== undefined)
    document[field.name] = { _type: "slug", current: value };
  const result = await validateDocument({ schema, client, document });
  return { markers: Array.isArray(result) ? result : result.markers, queries };
}

test("translations can share a pathname without invoking default uniqueness", async () => {
  const { markers, queries } = await validate(definePathname(), {
    existing: [{ _id: "english", locale: "en", path: "/shared" }],
  });
  assert.deepEqual(markers, []);
  assert.equal(queries.length, 1);
  assert.equal(queries[0].params.locale, "fr");
});

test("same-locale duplicate pathnames are rejected", async () => {
  const { markers, queries } = await validate(definePathname(), {
    existing: [{ _id: "french", locale: "fr", path: "/shared" }],
  });
  assert.equal(markers.length, 1);
  assert.match(markers[0].message, /already in use/);
  assert.equal(queries[0].params.locale, "fr");
});

for (const result of [true, false]) {
  test(`caller uniqueness callback returning ${result} remains authoritative`, async () => {
    let calls = 0;
    const { markers, queries } = await validate(
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
  const field = definePathname({ validation });
  assert.equal(field.validation, validation);
  const { markers } = await validate(field);
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
  const field = definePathname({ validation });
  assert.equal(field.validation, validation);
  const { markers } = await validate(field);
  assert.ok(markers.some((marker) => marker.message === "First policy"));
  assert.ok(markers.some((marker) => marker.message === "Second policy"));
});

test("absent pathname stays optional unless the caller requires it", async () => {
  for (const required of [false, true]) {
    const field = definePathname(
      required ? { validation: (rule) => rule.required() } : {},
    );
    const schema = createSchema({
      name: "optional-test",
      types: [{ name: "page", type: "document", fields: [field] }],
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
      document: { _id: "current", _type: "page" },
    });
    const markers = Array.isArray(result) ? result : result.markers;
    assert.equal(markers.length > 0, required);
    assert.ok(
      !markers.some((marker) => /Missing slugs|Exception/.test(marker.message)),
    );
  }
});

test("callback failures remain validation failures", async () => {
  const { markers, queries } = await validate(
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
  const options = Object.freeze({ source: "title" });
  const input = Object.freeze({ name: "customPath", options, validation });
  const field = definePathname(input);
  assert.equal(field.name, "customPath");
  assert.equal(field.options.source, "title");
  assert.equal(field.validation, validation);
  assert.equal(input.options, options);
});

for (const [prefix, otherPrefix, value, path, collision] of [
  ["blog", undefined, "/foo", "/foo", false],
  [undefined, "blog", "/foo", "/foo", false],
  [undefined, "blog", "/blog/foo", "/foo", true],
  ["blog", undefined, "/foo", "/blog/foo", true],
  ["blog", "/blog", "/foo", "/foo", true],
  [undefined, undefined, "/foo/", "/foo", true],
  [undefined, undefined, "/foo", "/foo/", false],
]) {
  test(`resolved paths ${JSON.stringify({ prefix, otherPrefix, value, path })}`, async () => {
    const { markers } = await validate(
      definePathname({ options: { prefix } }),
      {
        value,
        otherFields: [definePathname({ options: { prefix: otherPrefix } })],
        existing: [{ _id: "other", _type: "other0", locale: "fr", path }],
      },
    );
    assert.equal(markers.length, collision ? 1 : 0);
    if (collision) assert.match(markers[0].message, /already in use/);
  });
}
for (const asynchronous of [false, true]) {
  test(`dynamic prefix (${asynchronous ? "async" : "sync"}) receives its own document and context`, async () => {
    const prefix = (doc, context) => {
      assert.equal(doc._type, "other0");
      assert.ok(context.schema.get(doc._type));
      assert.equal(typeof context.getClient, "function");
      assert.equal(context.projectId, "test-project");
      assert.equal(context.dataset, "test-dataset");
      assert.equal(context.currentUser, null);
      return asynchronous
        ? Promise.resolve(doc.section ?? "blog")
        : (doc.section ?? "blog");
    };
    const { markers } = await validate(definePathname(), {
      value: "/blog/foo",
      otherFields: [definePathname({ options: { prefix } })],
      existing: [
        {
          _id: "other",
          _type: "other0",
          locale: "fr",
          path: "/foo",
          section: "blog",
        },
      ],
    });
    assert.equal(markers.length, 1);
    assert.match(markers[0].message, /already in use/);
  });
}
test("candidate prefix failures do not silently validate", async () => {
  const { markers } = await validate(definePathname(), {
    value: "/blog/foo",
    otherFields: [
      definePathname({
        options: {
          prefix: () => {
            throw new Error("Prefix unavailable");
          },
        },
      }),
    ],
    existing: [{ _id: "other", _type: "other0", locale: "fr", path: "/foo" }],
  });
  assert.ok(
    markers.some((marker) => marker.message.includes("Prefix unavailable")),
  );
});

test("candidate query pages past 100 noncollisions and excludes unrelated data", async () => {
  const existing = Array.from({ length: 101 }, (_, index) => ({
    _id: `item-${String(index).padStart(3, "0")}`,
    _type: "other0",
    locale: "fr",
    path: "/foo",
  }));
  existing.push({ _id: "z-collision", locale: "fr", path: "/blog/foo" });
  existing.push({ _id: "unrelated", locale: "fr", path: "/unrelated" });
  const { markers, queries } = await validate(definePathname(), {
    value: "/blog/foo",
    existing,
    otherFields: [definePathname({ options: { prefix: "news" } })],
  });
  assert.equal(markers.length, 1);
  assert.match(markers[0].message, /already in use/);
  assert.equal(queries.length, 2);
  assert.equal(queries[1].params.after, "item-099");
  assert.ok(!queries[0].params.paths.includes("/unrelated"));
  assert.match(queries[0].query, /\[0\.\.\.100\]/);
});
test("current draft and published documents are excluded", async () => {
  const { markers } = await validate(definePathname(), {
    existing: ["current", "drafts.current"].map((_id) => ({
      _id,
      locale: "fr",
      path: "/shared",
    })),
  });
  assert.deepEqual(markers, []);
});
test("missing locales remain in the same uniqueness scope", async () => {
  const { markers } = await validate(definePathname(), {
    locale: null,
    existing: [{ _id: "other", path: "/shared" }],
  });
  assert.equal(markers.length, 1);
  assert.match(markers[0].message, /already in use/);
});

for (const asynchronous of [false, true]) {
  test(`current document resolves its own ${asynchronous ? "async" : "sync"} prefix`, async () => {
    let calls = 0;
    const prefix = (doc, context) => {
      calls++;
      assert.equal(doc._id, "drafts.current");
      assert.equal(context.projectId, "test-project");
      return asynchronous ? Promise.resolve("blog") : "blog";
    };
    const { markers } = await validate(
      definePathname({ options: { prefix } }),
      {
        value: "/foo",
        otherFields: [definePathname()],
        existing: [
          { _id: "other", _type: "other0", locale: "fr", path: "/blog/foo" },
        ],
      },
    );
    assert.equal(calls, 1);
    assert.equal(markers.length, 1);
    assert.match(markers[0].message, /already in use/);
  });
}
test("invalid dynamic prefix results fail validation", async () => {
  const { markers } = await validate(
    definePathname({ options: { prefix: () => undefined } }),
  );
  assert.ok(
    markers.some((marker) =>
      marker.message.includes("prefix must resolve to a string"),
    ),
  );
});

for (const [prefix, otherPrefix, value, path, collision] of [
  ["blog", undefined, "/foo", "/foo", false],
  [undefined, "blog", "/foo", "/foo", false],
  ["blog", undefined, "/foo", "/blog/foo", true],
  [undefined, "blog", "/blog/foo", "/foo", true],
  ["blog", "blog", "/foo", "/foo", true],
]) {
  test(`custom route field across types ${JSON.stringify({ prefix, otherPrefix, value, path })}`, async () => {
    const { markers, queries } = await validate(
      definePathname({ name: "route", options: { prefix } }),
      {
        value,
        otherFields: [
          definePathname({ name: "route", options: { prefix: otherPrefix } }),
        ],
        existing: [{ _id: "other", _type: "other0", locale: "fr", path }],
      },
    );
    assert.equal(markers.length, collision ? 1 : 0);
    if (collision) assert.match(markers[0].message, /already in use/);
    assert.equal(queries.length, 1);
  });
}
for (const [name, otherName] of [
  ["route", "pathname"],
  ["pathname", "route"],
]) {
  test(`${name} does not compare a differently named ${otherName} field`, async () => {
    const { markers } = await validate(definePathname({ name }), {
      value: "/blog/foo",
      otherFields: [
        definePathname({ name: otherName, options: { prefix: "blog" } }),
      ],
      existing: [
        {
          _id: "other",
          _type: "other0",
          locale: "fr",
          path: "/foo",
          fieldName: otherName,
        },
      ],
    });
    assert.deepEqual(markers, []);
  });
}
test("same prefix and same slug collide across document types", async () => {
  const { markers } = await validate(
    definePathname({ options: { prefix: "blog" } }),
    {
      value: "/foo",
      otherFields: [definePathname({ options: { prefix: "blog" } })],
      existing: [{ _id: "other", _type: "other0", locale: "fr", path: "/foo" }],
    },
  );
  assert.equal(markers.length, 1);
  assert.match(markers[0].message, /already in use/);
});
for (const [prefix, otherPrefix] of [
  ["blog", "news"],
  ["news", "blog"],
]) {
  test(`different explicit prefixes ${prefix} and ${otherPrefix} produce distinct paths`, async () => {
    const { markers } = await validate(
      definePathname({ options: { prefix } }),
      {
        value: "/foo",
        otherFields: [definePathname({ options: { prefix: otherPrefix } })],
        existing: [
          { _id: "other", _type: "other0", locale: "fr", path: "/foo" },
        ],
      },
    );
    assert.deepEqual(markers, []);
  });
}
test("a throwing current-document prefix callback fails before querying", async () => {
  let calls = 0;
  const { markers, queries } = await validate(
    definePathname({
      options: {
        prefix: () => {
          calls++;
          throw new Error("Current prefix unavailable");
        },
      },
    }),
  );
  assert.equal(calls, 1);
  assert.equal(queries.length, 0);
  assert.ok(
    markers.some((marker) =>
      marker.message.includes("Current prefix unavailable"),
    ),
  );
});
test("different locales can share the same prefix and slug", async () => {
  const { markers, queries } = await validate(
    definePathname({ options: { prefix: "blog" } }),
    {
      value: "/foo",
      otherFields: [definePathname({ options: { prefix: "blog" } })],
      existing: [
        { _id: "english", _type: "other0", locale: "en", path: "/foo" },
      ],
    },
  );
  assert.deepEqual(markers, []);
  assert.equal(queries.length, 1);
  assert.equal(queries[0].params.locale, "fr");
});
