/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  entry: './pages/map.js',
  webpack: config => {
    config.optimization.splitChunks = false;
    return config;
  }
};

module.exports = nextConfig;
