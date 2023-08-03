const isProduction = process.env.NODE_ENV === 'production';
console.log(process.env.BASE_PATH);
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  basePath: process.env.BASE_PATH ?? '/reactgeoda',
  images: {unoptimized: true},
  generateBuildId: async () => 'reactgeoda-v0.1',
  webpack: config => {
    config.optimization.splitChunks = false;
    config.optimization.minimize = isProduction;
    return config;
  }
};

module.exports = nextConfig;
