export function getVercelBaseUrl() {
  const baseUrlWithoutProtocol =
    process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : process.env.VERCEL_BRANCH_URL;

  return baseUrlWithoutProtocol
    ? `https://${baseUrlWithoutProtocol}`
    : "http://localhost:3000";
}
