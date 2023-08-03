const isProduction = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  basePath: process.env.BASE_PATH,
  images: {unoptimized: true},
  generateBuildId: async () => 'reactgeoda-v0.1',
  webpack: config => {
    config.optimization.splitChunks = false;
    config.optimization.minimize = isProduction;
    return config;
  }
};

module.exports = nextConfig;
