import {NextRequest} from "next/server";
import {beforeEach, expect, it, vi} from "vitest";
import {proxy as blogProxy} from "../../../examples/blog-next/proxy";
import {proxy as i18nProxy} from "../../../examples/hello-world-i18n-next/proxy";
import {redirectIfNeeded} from "../src/utils/redirect";

const {redirect} = vi.hoisted(() => ({redirect: vi.fn()}));
vi.mock("../../../examples/blog-next/data/sanity/client", () => ({
	redirectIfNeeded: redirect,
}));
vi.mock("../../../examples/hello-world-i18n-next/data/sanity/client", () => ({
	redirectIfNeeded: redirect,
}));

beforeEach(() => redirect.mockReset());

it.each([blogProxy, i18nProxy])(
	"returns the package redirect response from the example proxy",
	async (proxy) => {
		const request = new NextRequest("https://example.com/jobs?gh_jid=123");
		const response = await redirectIfNeeded({
			request,
			matchQueryString: true,
			sanityFetch: async () => ({
				data: {
					source: "/jobs?gh_jid=123",
					destination: "/careers/design",
					permanent: true,
				},
			}),
		});
		redirect.mockResolvedValue(response);
		expect(await proxy(request)).toBe(response);
		expect(response.status).toBe(301);
		expect(response.headers.get("location")).toBe(
			"https://example.com/careers/design",
		);
	},
);

it("continues the blog request when there is no redirect", async () => {
	expect(
		await blogProxy(new NextRequest("https://example.com/missing")),
	).toBeUndefined();
});

it("continues the i18n rewrite, preserving the query, when there is no redirect", async () => {
	const response = await i18nProxy(
		new NextRequest("https://example.com/missing?x=1"),
	);
	expect(response.headers.get("x-middleware-rewrite")).toBe(
		"https://example.com/en/missing?x=1",
	);
	expect(
		await i18nProxy(new NextRequest("https://example.com/fr/missing?x=1")),
	).toBeUndefined();
});
