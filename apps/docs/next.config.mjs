import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  redirects: () => {
    return [
      {
        source: '/',
        destination: '/docs/sanity-next',
        permanent: true
      },
      {
        source: '/docs',
        destination: '/docs/sanity-next',
        permanent: true
      },
    ];
  },
};

export default withMDX(config);
