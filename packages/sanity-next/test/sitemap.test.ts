import {evaluate, parse} from "groq-js";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {initSanity} from "../src/client/init";
import type {DefinedFetchType} from "../src/utils/next-sanity-types";
import {initSanityI18nUtils, initSanityUtils} from "../src/utils/sanity";
import {
	generateSanityI18nSitemap,
	generateSanitySitemap,
	I18N_SITEMAP_QUERY,
	SITEMAP_QUERY,
} from "../src/utils/sitemap";

const {liveFetch} = vi.hoisted(() => ({liveFetch: vi.fn()}));
vi.mock("next-sanity/live", () => ({
	defineLive: () => ({sanityFetch: liveFetch}),
}));
vi.mock("../src/utils/draft-mode", () => ({
	defineDraftRoute: () => ({GET: vi.fn()}),
	createErrorDraftRoute: () => ({GET: vi.fn()}),
}));

const baseUrl = "https://example.com";
const i18n = {
	defaultLocaleId: "en",
	locales: [
		{id: "en", title: "English"},
		{id: "fr", title: "French"},
	],
};
const updatedAt = "2026-09-20T12:00:00Z";
const publishedAt = "2026-08-01T12:00:00Z";
const lastUpdatedAt = "2026-09-01T12:00:00Z";
const customQuery = `*[
  _type in ["legalPage"] &&
  coalesce(noIndex, false) == false &&
  defined(pathname.current)
] {
  _type,
  "pathname": pathname.current,
  "lastModified": coalesce(lastUpdatedAt, publishedAt)
}`;
const customI18nQuery = `*[
  _type == "legalPage" && coalesce(noIndex, false) == false &&
  defined(pathname.current) && locale == $locale
] {
  _type, locale, "pathname": pathname.current,
  "lastModified": coalesce(lastUpdatedAt, publishedAt),
  "translations": []
}`;

function fetchFrom(dataset: Record<string, unknown>[]) {
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

const page = (pathname: string, overrides: Record<string, unknown> = {}) => ({
	_id: pathname,
	_type: "legalPage",
	pathname: {current: pathname},
	_updatedAt: updatedAt,
	...overrides,
});

it("preserves default filtering, home URLs, pathname spelling, dates and fetch options", async () => {
	const {fetch, sanityFetch} = fetchFrom([
		page("/legal/", {seo: {indexable: true}}),
		{_id: "home", _type: "home", seo: {indexable: true}, _updatedAt: updatedAt},
		page("/missing-seo"),
		page("/hidden", {seo: {indexable: false}}),
		{_type: "other", seo: {indexable: true}},
	]);
	expect(
		await generateSanitySitemap({sanityFetch, websiteBaseURL: baseUrl}),
	).toEqual([
		{url: `${baseUrl}/legal/`, lastModified: updatedAt},
		{url: baseUrl, lastModified: updatedAt},
	]);
	expect(fetch).toHaveBeenCalledExactlyOnceWith({
		query: SITEMAP_QUERY,
		params: {homeType: "home"},
		perspective: "published",
		stega: false,
	});
});

it("uses custom eligibility and editorial dates without falling back to _updatedAt", async () => {
	const {fetch, sanityFetch} = fetchFrom([
		page("/updated", {lastUpdatedAt, publishedAt}),
		page("/published", {noIndex: false, publishedAt}),
		page("/undated"),
		page("/hidden", {noIndex: true}),
		page("/unimplemented", {_type: "article"}),
		{_type: "legalPage"},
	]);
	expect(
		await initSanityUtils({
			sanityFetch,
			baseUrl,
			sitemapQuery: customQuery,
		}).generateSitemap(),
	).toEqual([
		{url: `${baseUrl}/updated`, lastModified: lastUpdatedAt},
		{url: `${baseUrl}/published`, lastModified: publishedAt},
		{url: `${baseUrl}/undated`, lastModified: undefined},
	]);
	expect(fetch).toHaveBeenCalledWith({
		query: customQuery,
		params: {homeType: "home"},
		perspective: "published",
		stega: false,
	});
});

it("accepts empty results and omitted dates", async () => {
	const {sanityFetch} = fetchFrom([]);
	expect(
		await generateSanitySitemap({
			sanityFetch,
			websiteBaseURL: baseUrl,
			query: customQuery,
		}),
	).toEqual([]);
	const {sanityFetch: noDates} = fetchFrom([page("/undated")]);
	expect(
		await generateSanitySitemap({
			sanityFetch: noDates,
			websiteBaseURL: baseUrl,
			query: '*[]{_type, "pathname": pathname.current}',
		}),
	).toEqual([{url: `${baseUrl}/undated`, lastModified: undefined}]);
});

it("preserves default locale filtering, localized URLs and translation alternates", async () => {
	const {fetch, sanityFetch} = fetchFrom([
		page("/about", {_id: "en", locale: "en", seo: {indexable: true}}),
		page("/a-propos", {_id: "fr", locale: "fr", seo: {indexable: true}}),
		{
			_id: "translations",
			_type: "translation.metadata",
			translations: [
				{value: {_type: "reference", _ref: "en"}},
				{value: {_type: "reference", _ref: "fr"}},
			],
		},
		{
			_id: "home-en",
			_type: "home",
			locale: "en",
			seo: {indexable: true},
			_updatedAt: updatedAt,
		},
		{
			_id: "home-fr",
			_type: "home",
			locale: "fr",
			seo: {indexable: true},
			_updatedAt: updatedAt,
		},
		page("/hidden", {locale: "en", seo: {indexable: false}}),
	]);
	const routes = await initSanityI18nUtils({
		sanityFetch,
		baseUrl,
		i18n,
	}).generateSitemap();
	expect(routes).toHaveLength(4);
	expect(routes).toEqual(
		expect.arrayContaining([
			{
				url: `${baseUrl}/about`,
				lastModified: updatedAt,
				alternates: {
					languages: {
						en: `${baseUrl}/about`,
						fr: `${baseUrl}/fr/a-propos`,
						"x-default": `${baseUrl}/about`,
					},
				},
			},
			{
				url: `${baseUrl}/fr/a-propos`,
				lastModified: updatedAt,
				alternates: {
					languages: {
						en: `${baseUrl}/about`,
						fr: `${baseUrl}/fr/a-propos`,
						"x-default": `${baseUrl}/a-propos`,
					},
				},
			},
			expect.objectContaining({url: baseUrl, lastModified: updatedAt}),
			expect.objectContaining({url: `${baseUrl}/fr`, lastModified: updatedAt}),
		]),
	);
	for (const locale of ["en", "fr"])
		expect(fetch).toHaveBeenCalledWith({
			query: I18N_SITEMAP_QUERY,
			params: {homeType: "home", locale},
			perspective: "published",
			stega: false,
		});
});

it("runs a custom i18n query once per locale", async () => {
	const {fetch, sanityFetch} = fetchFrom([
		page("/legal", {locale: "en", publishedAt}),
		page("/mentions", {locale: "fr"}),
		page("/hidden", {locale: "fr", noIndex: true}),
	]);
	const routes = await generateSanityI18nSitemap({
		sanityFetch,
		websiteBaseURL: baseUrl,
		i18n,
		query: customI18nQuery,
	});
	expect(routes).toEqual(
		expect.arrayContaining([
			expect.objectContaining({
				url: `${baseUrl}/legal`,
				lastModified: publishedAt,
			}),
			expect.objectContaining({
				url: `${baseUrl}/fr/mentions`,
				lastModified: undefined,
			}),
		]),
	);
	expect(routes).toHaveLength(2);
	expect(fetch).toHaveBeenCalledTimes(2);
	for (const locale of ["en", "fr"])
		expect(fetch).toHaveBeenCalledWith({
			query: customI18nQuery,
			params: {homeType: "home", locale},
			perspective: "published",
			stega: false,
		});
});

it.each([
	[
		"missing locale",
		[{_type: "legalPage", pathname: "/legal", translations: []}],
	],
	[
		"missing translations",
		[{_type: "legalPage", pathname: "/legal", locale: "en"}],
	],
	[
		"wrong locale",
		[{_type: "legalPage", pathname: "/legal", locale: "fr", translations: []}],
	],
	["non-array result", null],
])("rejects custom i18n results with %s", async (_name, data) => {
	const sanityFetch = vi
		.fn()
		.mockResolvedValue({data}) as unknown as DefinedFetchType;
	await expect(
		generateSanityI18nSitemap({
			sanityFetch,
			websiteBaseURL: baseUrl,
			i18n: {...i18n, locales: [i18n.locales[0]]},
			query: customQuery,
		}),
	).rejects.toThrow(
		'Custom i18n sitemap query must return an array of routes with locale "en" and a translations array',
	);
});

it("accepts an empty custom i18n sitemap", async () => {
	const {sanityFetch} = fetchFrom([]);
	expect(
		await generateSanityI18nSitemap({
			sanityFetch,
			websiteBaseURL: baseUrl,
			i18n,
			query: customI18nQuery,
		}),
	).toEqual([]);
});

describe("initSanity public configuration", () => {
	beforeEach(() => {
		vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "test1234");
		vi.stubEnv("NEXT_PUBLIC_SANITY_DATASET", "production");
		vi.stubEnv("SANITY_API_TOKEN", "test-token");
		liveFetch.mockReset().mockResolvedValue({data: []});
	});
	afterEach(() => vi.unstubAllEnvs());
	for (const live of [
		undefined,
		{serverToken: false as const, browserToken: false as const},
	]) {
		for (const locales of [undefined, i18n]) {
			it(`forwards custom and default queries with live=${!!live}, i18n=${!!locales}`, async () => {
				for (const sitemapQuery of [
					undefined,
					locales ? customI18nQuery : customQuery,
				]) {
					liveFetch.mockClear();
					await initSanity({
						baseUrl,
						live,
						i18n: locales,
						sitemapQuery,
					}).generateSitemap();
					expect(liveFetch).toHaveBeenCalledTimes(locales ? 2 : 1);
					expect(liveFetch).toHaveBeenCalledWith(
						expect.objectContaining({
							query:
								sitemapQuery ?? (locales ? I18N_SITEMAP_QUERY : SITEMAP_QUERY),
							perspective: "published",
							stega: false,
						}),
					);
				}
			});
		}
	}
});
