/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  basePath: '/reactgeoda',
  images: {
    unoptimized: true
  },
  entry: './pages/map.js',
  webpack: config => {
    config.optimization.splitChunks = false;
    return config;
  }
};

module.exports = nextConfig;
