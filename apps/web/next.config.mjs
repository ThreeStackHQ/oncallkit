/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@oncallkit/db', '@oncallkit/types'],
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
