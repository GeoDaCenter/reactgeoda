const isProduction = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  output: 'export',
  basePath: process.env.BASE_PATH ?? '/reactgeoda',
  images: {unoptimized: true},
  generateBuildId: async () => 'reactgeoda-v0.1',
  webpack: (config, options) => {
    config.optimization.splitChunks = false;
    config.optimization.minimize = isProduction;
    if (!options.dev) {
      // when build production for 3rd party e.g. data-and-lab, remove hash id from file name
      config.output.filename = config.output.filename.replace('-[contenthash]', '');
      config.output.chunkFilename = config.output.chunkFilename.replace('.[contenthash]', '');
      config.output.webassemblyModuleFilename = config.output.chunkFilename.replace('.[modulehash]', '');
      const CopyFilePlugin = config.plugins.find(item => item.constructor.name === 'CopyFilePlugin');
      if (CopyFilePlugin) {
        CopyFilePlugin.name = CopyFilePlugin.name.replace('-[hash]', '');
      }
      const NextMiniCssExtractPlugin = config.plugins.find(item => item.constructor.name === 'NextMiniCssExtractPlugin');
      if (NextMiniCssExtractPlugin) {
        NextMiniCssExtractPlugin.options.filename = NextMiniCssExtractPlugin.options.filename.replace('[contenthash]', '[name]');
        NextMiniCssExtractPlugin.options.chunkFilename = NextMiniCssExtractPlugin.options.chunkFilename.replace('[contenthash]', '[name]');
      }
    }
    return config;
  }
};

module.exports = nextConfig;
