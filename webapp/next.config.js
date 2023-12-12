const {resolve} = require('path');

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  basePath: process.env.BASE_PATH ?? '/reactgeoda',
  images: {unoptimized: true},
  generateBuildId: async () => 'reactgeoda-v0.1',
  typescript: {
    // !! WARN !!
    ignoreBuildErrors: true
  },
  webpack: (config, options) => {
    config.optimization.splitChunks = false;
    config.optimization.minimize = isProduction;
    if (!options.dev) {
      // when build production for 3rd party e.g. data-and-lab, remove hash id from file name
      config.output.filename = config.output.filename.replace('-[contenthash]', '');
      config.output.chunkFilename = config.output.chunkFilename.replace('.[contenthash]', '');
      config.output.webassemblyModuleFilename = config.output.chunkFilename.replace(
        '.[modulehash]',
        ''
      );
      const CopyFilePlugin = config.plugins.find(
        item => item.constructor.name === 'CopyFilePlugin'
      );
      if (CopyFilePlugin) {
        CopyFilePlugin.name = CopyFilePlugin.name.replace('-[hash]', '');
      }
      const NextMiniCssExtractPlugin = config.plugins.find(
        item => item.constructor.name === 'NextMiniCssExtractPlugin'
      );
      if (NextMiniCssExtractPlugin) {
        NextMiniCssExtractPlugin.options.filename =
          NextMiniCssExtractPlugin.options.filename.replace('[contenthash]', '[name]');
        NextMiniCssExtractPlugin.options.chunkFilename =
          NextMiniCssExtractPlugin.options.chunkFilename.replace('[contenthash]', '[name]');
      }
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      'apache-arrow': resolve(__dirname, '../node_modules/apache-arrow'),
      '@mapbox/tiny-sdf': resolve(__dirname, '../node_modules/@mapbox/tiny-sdf/index.cjs'),
      '@kepler.gl/effects': resolve(__dirname, './kepler.gl/src/effects/src/index'),
      '@kepler.gl/reducers': resolve(__dirname, './kepler.gl/src/reducers/src/index'),
      '@kepler.gl/actions': resolve(__dirname, './kepler.gl/src/actions/src/index'),
      '@kepler.gl/constants': resolve(__dirname, './kepler.gl/src/constants/src/index'),
      '@kepler.gl/components': resolve(__dirname, './kepler.gl/src/components/src/index'),
      '@kepler.gl/utils': resolve(__dirname, './kepler.gl/src/utils/src/index'),
      '@kepler.gl/styles': resolve(__dirname, './kepler.gl/src/styles/src/index'),
      '@kepler.gl/types': resolve(__dirname, './kepler.gl/src/types/index'),
      '@kepler.gl/localization': resolve(__dirname, './kepler.gl/src/localization/src/index'),
      '@kepler.gl/layers': resolve(__dirname, './kepler.gl/src/layers/src/index'),
      '@kepler.gl/table': resolve(__dirname, './kepler.gl/src/table/src/index'),
      '@kepler.gl/tasks': resolve(__dirname, './kepler.gl/src/tasks/src/index'),
      '@kepler.gl/schemas': resolve(__dirname, './kepler.gl/src/schemas/src/index'),
      '@kepler.gl/deckgl-layers': resolve(__dirname, './kepler.gl/src/deckgl-layers/src/index'),
      '@kepler.gl/cloud-providers': resolve(__dirname, './kepler.gl/src/cloud-providers/src/index'),
      '@kepler.gl/processors': resolve(__dirname, './kepler.gl/src/processors/src/index')
      // '@loaders.gl/arrow': resolve(__dirname, '../../loaders.gl/modules/arrow/src'),
      // '@loaders.gl/core': resolve(__dirname, '../../loaders.gl/modules/core/src'),
      // '@loaders.gl/gis': resolve(__dirname, '../../loaders.gl/modules/gis/src'),
      // '@loaders.gl/gltf': resolve(__dirname, '../../loaders.gl/modules/gltf/src'),
      // '@loaders.gl/json': resolve(__dirname, '../../loaders.gl/modules/json/src'),
      // '@loaders.gl/loader-utils': resolve(__dirname, '../../loaders.gl/modules/loader-utils/src'),
      // '@loaders.gl/schema': resolve(__dirname, '../../loaders.gl/modules/schema/src'),
      // '@loaders.gl/shapefile': resolve(__dirname, '../../loaders.gl/modules/shapefile/src'),
      // '@loaders.gl/wkt': resolve(__dirname, '../../loaders.gl/modules/wkt/src'),
      // '@loaders.gl/parquet': resolve(__dirname, '../../loaders.gl/modules/parquet/src'),
      // '@loaders.gl/polyfill': resolve(__dirname, '../../loaders.gl/modules/polyfill/src')
    };
    config.module.rules.push({
      test: /\.(cjs|ts)$/,
      use: {
        loader: 'babel-loader'
      }
    });
    return config;
  }
};

module.exports = nextConfig;
