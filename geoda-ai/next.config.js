const { resolve } = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  basePath: process.env.BASE_PATH ?? '/reactgeoda',
  typescript: {
    // !! WARN !! This is to ignore build errors from Kepler.gl
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // This following line is to support WASM modules
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      topLevelAwait: true,
    };
    config.output.assetModuleFilename = 'static/[hash][ext]';
    config.output.publicPath = '/_next/';
    config.module.rules.push({
      test: /\.wasm/,
      type: 'asset/resource',
      // type: 'webassembly/async'
    });

    // Configure to use local version of Kepler.gl
    config.resolve.alias = {
      ...config.resolve.alias,
      // 'apache-arrow': resolve(__dirname, '../node_modules/apache-arrow'),
      // '@dnd-kit/core': resolve(__dirname, '../node_modules/@dnd-kit/core'),
      '@mapbox/tiny-sdf': resolve(
        __dirname,
        '../../csds_kepler/node_modules/@mapbox/tiny-sdf/index.cjs'
      ),
      '@kepler.gl/effects': resolve(
        __dirname,
        '../../csds_kepler/src/effects/src/index'
      ),
      '@kepler.gl/reducers': resolve(
        __dirname,
        '../../csds_kepler/src/reducers/src/index'
      ),
      '@kepler.gl/actions': resolve(
        __dirname,
        '../../csds_kepler/src/actions/src/index'
      ),
      '@kepler.gl/constants': resolve(
        __dirname,
        '../../csds_kepler/src/constants/src/index'
      ),
      '@kepler.gl/components': resolve(
        __dirname,
        '../../csds_kepler/src/components/src/index'
      ),
      '@kepler.gl/utils': resolve(
        __dirname,
        '../../csds_kepler/src/utils/src/index'
      ),
      '@kepler.gl/styles': resolve(
        __dirname,
        '../../csds_kepler/src/styles/src/index'
      ),
      '@kepler.gl/types': resolve(__dirname, '../../csds_kepler/src/types'),
      '@kepler.gl/localization': resolve(
        __dirname,
        '../../csds_kepler/src/localization/src/index'
      ),
      '@kepler.gl/layers': resolve(
        __dirname,
        '../../csds_kepler/src/layers/src/index'
      ),
      '@kepler.gl/table': resolve(
        __dirname,
        '../../csds_kepler/src/table/src/index'
      ),
      '@kepler.gl/tasks': resolve(
        __dirname,
        '../../csds_kepler/src/tasks/src/index'
      ),
      '@kepler.gl/schemas': resolve(
        __dirname,
        '../../csds_kepler/src/schemas/src/index'
      ),
      '@kepler.gl/deckgl-layers': resolve(
        __dirname,
        '../../csds_kepler/src/deckgl-layers/src/index'
      ),
      '@kepler.gl/cloud-providers': resolve(
        __dirname,
        '../../csds_kepler/src/cloud-providers/src/index'
      ),
      '@kepler.gl/processors': resolve(
        __dirname,
        '../../csds_kepler/src/processors/src/index'
      ),
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

    // This is to fix warnings about missing critical dependencies reported by loaders.gl using require()
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };

    return config;
  },
};

module.exports = nextConfig;
