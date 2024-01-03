const {resolve} = require('path');

// const isProduction = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  // output: 'standalone',
  basePath: process.env.BASE_PATH ? process.env.BASE_PATH : '/reactgeoda',
  images: {unoptimized: true},
  generateBuildId: async () => 'reactgeoda-v0.1',
  typescript: {
    // !! WARN !!
    ignoreBuildErrors: true
  },
  webpack: config => {
    config.experiments = Object.assign({}, config.experiments, {
      asyncWebAssembly: true,
      topLevelAwait: true
    });
    config.output.assetModuleFilename = 'static/[hash][ext]';
    config.output.publicPath = '/_next/';
    config.module.rules.push({
      test: /\.wasm/,
      type: 'asset/resource'
      // type: 'webassembly/async'
    });
    // config.optimization.splitChunks = false;
    // config.optimization.minimize = isProduction;
    // if (!options.dev) {
    //   // when build production for 3rd party e.g. data-and-lab, remove hash id from file name
    //   config.output.filename = config.output.filename.replace('-[contenthash]', '');
    //   config.output.chunkFilename = config.output.chunkFilename.replace('.[contenthash]', '');
    //   config.output.webassemblyModuleFilename = config.output.chunkFilename.replace(
    //     '.[modulehash]',
    //     ''
    //   );
    //   const CopyFilePlugin = config.plugins.find(
    //     item => item.constructor.name === 'CopyFilePlugin'
    //   );
    //   if (CopyFilePlugin) {
    //     CopyFilePlugin.name = CopyFilePlugin.name.replace('-[hash]', '');
    //   }
    //   const NextMiniCssExtractPlugin = config.plugins.find(
    //     item => item.constructor.name === 'NextMiniCssExtractPlugin'
    //   );
    //   if (NextMiniCssExtractPlugin) {
    //     NextMiniCssExtractPlugin.options.filename =
    //       NextMiniCssExtractPlugin.options.filename.replace('[contenthash]', '[name]');
    //     NextMiniCssExtractPlugin.options.chunkFilename =
    //       NextMiniCssExtractPlugin.options.chunkFilename.replace('[contenthash]', '[name]');
    //   }
    // }
    config.resolve.alias = {
      ...config.resolve.alias,
      // 'apache-arrow': resolve(__dirname, '../node_modules/apache-arrow'),
      // '@dnd-kit/core': resolve(__dirname, '../node_modules/@dnd-kit/core'),
      // '@mapbox/tiny-sdf': resolve(
      //   __dirname,
      //   '../../csds_kepler/node_modules/@mapbox/tiny-sdf/index.cjs'
      // ),
      '@kepler.gl/effects': resolve(__dirname, '../../csds_kepler/src/effects/src/index'),
      '@kepler.gl/reducers': resolve(__dirname, '../../csds_kepler/src/reducers/src/index'),
      '@kepler.gl/actions': resolve(__dirname, '../../csds_kepler/src/actions/src/index'),
      '@kepler.gl/constants': resolve(__dirname, '../../csds_kepler/src/constants/src/index'),
      '@kepler.gl/components': resolve(__dirname, '../../csds_kepler/src/components/src/index'),
      '@kepler.gl/utils': resolve(__dirname, '../../csds_kepler/src/utils/src/index'),
      '@kepler.gl/styles': resolve(__dirname, '../../csds_kepler/src/styles/src/index'),
      '@kepler.gl/types': resolve(__dirname, '../../csds_kepler/src/types'),
      '@kepler.gl/localization': resolve(__dirname, '../../csds_kepler/src/localization/src/index'),
      '@kepler.gl/layers': resolve(__dirname, '../../csds_kepler/src/layers/src/index'),
      '@kepler.gl/table': resolve(__dirname, '../../csds_kepler/src/table/src/index'),
      '@kepler.gl/tasks': resolve(__dirname, '../../csds_kepler/src/tasks/src/index'),
      '@kepler.gl/schemas': resolve(__dirname, '../../csds_kepler/src/schemas/src/index'),
      '@kepler.gl/deckgl-layers': resolve(
        __dirname,
        '../../csds_kepler/src/deckgl-layers/src/index'
      ),
      '@kepler.gl/cloud-providers': resolve(
        __dirname,
        '../../csds_kepler/src/cloud-providers/src/index'
      ),
      '@kepler.gl/processors': resolve(__dirname, '../../csds_kepler/src/processors/src/index')
      // '@deck.gl/layers': resolve(__dirname, '../../csds_kepler/node_modules/@deck.gl/layers'),
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
      test: /\.(cjs|ts|tsx)$/,
      use: {
        loader: 'babel-loader'
      }
    });
    return config;
  }
};

module.exports = nextConfig;
