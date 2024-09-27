const {resolve} = require('path');
const {withSentryConfig} = require('@sentry/nextjs');

// const CopyPlugin = require('copy-webpack-plugin');

// import package.json to get version from ../../csds_kepler/package.json
const packageJson = require('../../csds_kepler/package.json');
const keplerVersion = packageJson.version;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // set react strict mode false to fix react-modal cannot register modal instance that's already open
  reactStrictMode: false,
  // enable a static export and export all pages to static HTML files under out folder
  output: 'export',
  // discard: only set basePath to /reactgeoda to deploy in github pages
  basePath: process.env.BASE_PATH ?? '/reactgeoda',
  typescript: {
    // !! WARN !! This is to ignore build errors from Kepler.gl
    ignoreBuildErrors: true
  },
  compiler: {
    // remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production'
  },
  webpack: config => {
    // Support WASM modules for duckdb and geoda
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      topLevelAwait: true
    };
    config.output.assetModuleFilename = 'static/[hash][ext]';
    config.output.publicPath = '/_next/';
    config.module.rules.push({
      test: /\.wasm/,
      type: 'asset/resource',
      // type: 'webassembly/async'
      generator: {
        // specify the output location of the wasm files
        filename: 'static/chunks/app/preview/[name][ext]'
      }
    });

    // Configure to use local version of Kepler.gl
    config.resolve.alias = {
      ...config.resolve.alias,
      'apache-arrow': resolve(__dirname, './node_modules/apache-arrow'),
      'styled-components': resolve(__dirname, '../../csds_kepler/node_modules/styled-components'),
      'geoda-wasm': resolve(__dirname, '../../geoda-lib/src/js'),
      'soft-ai': resolve(__dirname, '../../ai-assistant/src'),
      // '@dnd-kit/core': resolve(__dirname, '../node_modules/@dnd-kit/core'),
      '@mapbox/tiny-sdf': resolve(
        __dirname,
        '../../csds_kepler/node_modules/@mapbox/tiny-sdf/index.cjs'
      ),
      'react-palm': resolve(__dirname, '../../csds_kepler/node_modules/react-palm'),
      'asciify-image': resolve(__dirname, './node_modules/asciify-image'),
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
      '@kepler.gl/processors': resolve(__dirname, '../../csds_kepler/src/processors/src/index'),
      // '@deck.gl/layers': resolve(__dirname, '../../csds_kepler/node_modules/@deck.gl/layers'),
      '@loaders.gl/arrow': resolve(__dirname, '../../loaders.gl/modules/arrow/src'),
      '@loaders.gl/core': resolve(__dirname, '../../loaders.gl/modules/core/src'),
      '@loaders.gl/gis': resolve(__dirname, '../../loaders.gl/modules/gis/src'),
      '@loaders.gl/gltf': resolve(__dirname, '../../loaders.gl/modules/gltf/src'),
      '@loaders.gl/json': resolve(__dirname, '../../loaders.gl/modules/json/src'),
      '@loaders.gl/loader-utils': resolve(__dirname, '../../loaders.gl/modules/loader-utils/src'),
      '@loaders.gl/schema': resolve(__dirname, '../../loaders.gl/modules/schema/src'),
      '@loaders.gl/shapefile': resolve(__dirname, '../../loaders.gl/modules/shapefile/src'),
      '@loaders.gl/wkt': resolve(__dirname, '../../loaders.gl/modules/wkt/src'),
      '@loaders.gl/parquet': resolve(__dirname, '../../loaders.gl/modules/parquet/src'),
      '@loaders.gl/polyfill': resolve(__dirname, '../../loaders.gl/modules/polyfill/src')
    };

    // This is to fix warnings about missing critical dependencies reported by loaders.gl using require()
    config.module = {
      ...config.module,
      exprContextCritical: false
    };

    // This is to fix Apache-arrow v13 warning
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto'
    });

    // This is to find and replace __PACKAGE_VERSION__ with 3.0.0 in kepler
    config.module.rules.push({
      test: /\.ts$/,
      loader: 'string-replace-loader',
      options: {
        search: '__PACKAGE_VERSION__',
        replace: keplerVersion,
        flags: 'g'
      }
    });

    // Define global variable __VERSION__ with value "4.1.0" for loaders.gl
    config.plugins.push(
      new (require('webpack').DefinePlugin)({
        __VERSION__: JSON.stringify('4.2.1')
      })
    );

    // This is to avoid error when using GeoDaWASM
    config.resolve.fallback = {fs: false};

    // discard: Use copyPlugin to copy static file to public folder
    // config.plugins.push(
    //   new CopyPlugin({
    //     patterns: [
    //       {
    //         from: resolve(__dirname, '../../geoda-lib/src/js/dist/geoda.wasm'),
    //         to: 'public/geoda.wasm'
    //       }
    //     ]
    //   })
    // );

    return config;
  }
};

module.exports =
  process.env.BUILD_WITH_SENTRY === 'true'
    ? withSentryConfig(nextConfig, {
        org: 'geoda',
        project: 'reactgeoda',
        authToken: process.env.SENTRY_AUTH_TOKEN,
        silent: false,
        sourcemaps: true,
        // Use `hidden-source-map` rather than `source-map` as the Webpack `devtool`
        // for client-side builds. (This will be the default starting in
        // `@sentry/nextjs` version 8.0.0.) See
        // https://webpack.js.org/configuration/devtool/ and
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#use-hidden-source-map
        // for more information.
        // hideSourceMaps: true,
        telemetry: false
      })
    : nextConfig;
