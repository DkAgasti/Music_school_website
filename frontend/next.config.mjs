/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://backend-api-950635178949.asia-southeast1.run.app/api/:path*',
      },
    ];
  },
};

export default nextConfig;