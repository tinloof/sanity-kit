import type {NextConfig} from "next";

const config: NextConfig = {
	images: {
		remotePatterns: [{hostname: "cdn.sanity.io"}],
	},
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
};

export default config;
