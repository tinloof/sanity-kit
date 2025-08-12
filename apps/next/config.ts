const config = {
  sanity: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || '',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-06-21',
    revalidateSecret: process.env.SANITY_REVALIDATE_SECRET || '',
    studioUrl: '/studio',
  },
  siteDomain: process.env.NEXT_PUBLIC_SITE_DOMAIN || '',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || '',
}

export default config
