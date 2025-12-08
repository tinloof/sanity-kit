const baseUrlWithoutProtocol =
	process.env.VERCEL_ENV === "production"
		? process.env.VERCEL_PROJECT_PRODUCTION_URL
		: process.env.VERCEL_BRANCH_URL;

const baseUrl = baseUrlWithoutProtocol
	? `https://${baseUrlWithoutProtocol}`
	: "http://localhost:3000";

const config = {
	sanity: {
		projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
		dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
		apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2023-06-21",
		studioUrl: "/cms",
	},
	baseUrl,
	siteName: "Next Basic Website",
};

export default config;
