import {NextConfig} from "next";

const config: NextConfig = {
  images: {
    remotePatterns: [{hostname: "cdn.sanity.io"}],
  },
  eslint: {
    /// Set this to false if you want production builds to abort if there's lint errors
    ignoreDuringBuilds: process.env.VERCEL_ENV === "production",
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default config;
