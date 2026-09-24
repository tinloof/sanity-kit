import {evaluate, parse} from "groq-js";
import {NextRequest} from "next/server";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {initSanity} from "../src/client/init";
import type {DefinedFetchType} from "../src/utils/next-sanity-types";
import {getRedirect, redirectIfNeeded} from "../src/utils/redirect";
import {initSanityI18nUtils, initSanityUtils} from "../src/utils/sanity";
import {getPathVariations} from "../src/utils/urls";

const {liveFetch} = vi.hoisted(() => ({liveFetch: vi.fn()}));
vi.mock("next-sanity/live", () => ({
	defineLive: () => ({sanityFetch: liveFetch}),
}));
vi.mock("../src/utils/draft-mode", () => ({
	defineDraftRoute: () => ({GET: vi.fn()}),
	createErrorDraftRoute: () => ({GET: vi.fn()}),
}));

const baseUrl = "https://example.com";
const i18n = {defaultLocaleId: "en", locales: [{id: "en", title: "English"}]};
const fallback = {source: "/jobs", destination: "/careers", permanent: true};
const exact = {
	source: "/jobs?gh_jid=5089924002",
	destination: "/careers/design-manager?ref=jobs#apply",
	permanent: true,
};
const customQuery = '*[_type == "siteSettings"][0].rules[source in $paths][0]';

function fetchFrom(rules = [fallback, exact], custom = false) {
	const dataset = [
		{_type: custom ? "siteSettings" : "settings", redirects: rules, rules},
	];
	const fetch = vi.fn(
		async ({
			query,
			params,
		}: {
			query: string;
			params?: Record<string, unknown>;
		}) => ({
			data: await (await evaluate(parse(query), {dataset, params})).get(),
		}),
	);
	return {fetch, sanityFetch: fetch as unknown as DefinedFetchType};
}

function request(path: string) {
	return new NextRequest(baseUrl + path);
}

it("keeps default callers path-only, including custom $paths queries", async () => {
	for (const query of [undefined, customQuery]) {
		const {fetch, sanityFetch} = fetchFrom(undefined, !!query);
		const response = await redirectIfNeeded({
			request: request(exact.source),
			sanityFetch,
			query,
		});
		expect(response?.status).toBe(301);
		expect(response?.headers.get("location")).toBe(
			baseUrl + fallback.destination,
		);
		expect(fetch).toHaveBeenCalledTimes(1);
		expect(fetch.mock.calls[0][0].params).toEqual({
			paths: getPathVariations("/jobs"),
		});
	}
});

it.each([undefined, customQuery])(
	"prioritizes the full query over an earlier path rule with query=%s",
	async (query) => {
		const {fetch, sanityFetch} = fetchFrom(undefined, !!query);
		expect(
			await getRedirect({
				source: exact.source,
				sanityFetch,
				query,
				matchQueryString: true,
			}),
		).toEqual(exact);
		expect(fetch).toHaveBeenCalledTimes(1);
		expect(fetch.mock.calls[0][0]).toEqual({
			query: query ?? expect.any(String),
			params: {
				paths: [
					"jobs?gh_jid=5089924002",
					"/jobs/?gh_jid=5089924002",
					"jobs/?gh_jid=5089924002",
					exact.source,
				],
			},
			perspective: "published",
			stega: false,
		});
	},
);

it.each([
	"/jobs?utm_source=test&gh_jid=5089924002",
	"/jobs?gh_jid=5089924002&utm_source=test",
	"/jobs?gh_jid=other",
	"/jobs?gh_jid=5089924002&gh_jid=5089924002",
])("falls back without preserving incoming parameters: %s", async (source) => {
	const {fetch, sanityFetch} = fetchFrom();
	const response = await redirectIfNeeded({
		request: request(source),
		sanityFetch,
		matchQueryString: true,
	});
	expect(response?.headers.get("location")).toBe(
		baseUrl + fallback.destination,
	);
	expect(fetch).toHaveBeenCalledTimes(2);
	for (const [options] of fetch.mock.calls) {
		expect(options).toMatchObject({perspective: "published", stega: false});
	}
	expect(fetch.mock.calls[1][0].params).toEqual({
		paths: getPathVariations("/jobs"),
	});
});

it.each(["/jobs", "/jobs?", "/jobs/", "jobs"])(
	"looks up query-free sources once: %s",
	async (source) => {
		const {fetch, sanityFetch} = fetchFrom();
		expect(
			await getRedirect({source, sanityFetch, matchQueryString: true}),
		).toEqual(fallback);
		expect(fetch).toHaveBeenCalledTimes(1);
	},
);

it.each([
	["/jobs/?gh_jid=5089924002", exact.source],
	[
		"/jobs?next=https%3A%2F%2Fexample.com%2F",
		"/jobs?next=https%3A%2F%2Fexample.com%2F",
	],
	["/jobs?next=https://example.com/", "/jobs?next=https://example.com/"],
	["/jobs?a=1&a=2&empty=", "/jobs?a=1&a=2&empty="],
	["/Jobs?name=Alice+Smith", "/Jobs?name=Alice+Smith"],
])(
	"matches pathname variations without changing the query: %s",
	async (source, storedSource) => {
		const rule = {...exact, source: storedSource};
		const {sanityFetch} = fetchFrom([fallback, rule]);
		const response = await redirectIfNeeded({
			request: request(source),
			sanityFetch,
			matchQueryString: true,
		});
		expect(response?.headers.get("location")).toBe(baseUrl + exact.destination);
	},
);

it.each([
	["/jobs?a=1&b=2", "/jobs?b=2&a=1"],
	["/jobs?name=Alice%20Smith", "/jobs?name=Alice+Smith"],
	["/jobs?next=%2f", "/jobs?next=%2F"],
	["/jobs?a=1&a=2", "/jobs?a=2&a=1"],
	["/jobs?name=alice", "/jobs?name=Alice"],
	["/Jobs?x=1", "/jobs?x=1"],
])(
	"does not normalize query order, encoding or case: %s",
	async (source, storedSource) => {
		const {sanityFetch} = fetchFrom([{...exact, source: storedSource}]);
		expect(
			await redirectIfNeeded({
				request: request(source),
				sanityFetch,
				matchQueryString: true,
			}),
		).toBeUndefined();
	},
);

it("preserves first-match ordering within each lookup", async () => {
	const first = {
		...exact,
		source: "/jobs/?gh_jid=5089924002",
		destination: "/first",
	};
	const {sanityFetch} = fetchFrom([fallback, first, exact]);
	expect(
		await getRedirect({
			source: exact.source,
			sanityFetch,
			matchQueryString: true,
		}),
	).toEqual(first);
});

it.each([
	[true, "/new?campaign=a%20b#form", 301],
	[false, "https://other.example/new?campaign=a+b#form", 302],
	[true, "http://other.example/new?campaign=a+b", 301],
] as const)(
	"preserves status and destination: %s %s",
	async (permanent, destination, status) => {
		const {sanityFetch} = fetchFrom([{...exact, permanent, destination}]);
		const response = await redirectIfNeeded({
			request: request(exact.source),
			sanityFetch,
			matchQueryString: true,
		});
		expect(response?.status).toBe(status);
		expect(response?.headers.get("location")).toBe(
			new URL(destination, baseUrl).href,
		);
	},
);

it("returns no response for missing rules or empty destinations", async () => {
	for (const rules of [[], [{...exact, destination: ""}]]) {
		const {sanityFetch} = fetchFrom(rules);
		expect(
			await redirectIfNeeded({
				request: request(exact.source),
				sanityFetch,
				matchQueryString: true,
			}),
		).toBeUndefined();
	}
});

it("propagates lookup errors without silently using the fallback", async () => {
	const fetch = vi.fn().mockRejectedValue(new Error("Lookup failed"));
	await expect(
		getRedirect({
			source: exact.source,
			sanityFetch: fetch as unknown as DefinedFetchType,
			matchQueryString: true,
		}),
	).rejects.toThrow("Lookup failed");
	expect(fetch).toHaveBeenCalledTimes(1);
});

it.each(["/jobs(.*)", "/jobs*"])(
	"does not expand wildcard sources: %s",
	async (source) => {
		const {sanityFetch} = fetchFrom([{...exact, source}]);
		expect(
			await getRedirect({
				source: "/jobs/design?x=1",
				sanityFetch,
				matchQueryString: true,
			}),
		).toBeNull();
	},
);

it("forwards options through both standalone utility wrappers", async () => {
	const {sanityFetch} = fetchFrom(undefined, true);
	const config = {
		sanityFetch,
		baseUrl,
		redirects: {matchQueryString: true, query: customQuery},
	};
	for (const utils of [
		initSanityUtils(config),
		initSanityI18nUtils({...config, i18n}),
	]) {
		const response = await utils.redirectIfNeeded({
			request: request(exact.source),
		});
		expect(response?.headers.get("location")).toBe(baseUrl + exact.destination);
	}
});

describe("initSanity redirect configuration", () => {
	beforeEach(() => {
		vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "test1234");
		vi.stubEnv("NEXT_PUBLIC_SANITY_DATASET", "production");
		vi.stubEnv("SANITY_API_TOKEN", "test-token");
		liveFetch.mockReset();
	});
	afterEach(() => vi.unstubAllEnvs());
	for (const live of [
		undefined,
		{serverToken: false as const, browserToken: false as const},
	]) {
		for (const locales of [undefined, i18n]) {
			it(`preserves defaults and forwards options with live=${!!live}, i18n=${!!locales}`, async () => {
				for (const redirects of [
					undefined,
					{},
					{matchQueryString: false},
					{matchQueryString: true},
					{matchQueryString: true, query: customQuery},
				]) {
					const {fetch} = fetchFrom(undefined, !!redirects?.query);
					liveFetch.mockImplementation(fetch);
					const response = await initSanity({
						baseUrl,
						live,
						i18n: locales,
						redirects,
					}).redirectIfNeeded({request: request(exact.source)});
					expect(response?.status).toBe(301);
					expect(response?.headers.get("location")).toBe(
						baseUrl +
							(redirects?.matchQueryString
								? exact.destination
								: fallback.destination),
					);
					expect(fetch).toHaveBeenCalledTimes(1);
				}
			});
		}
	}
});
