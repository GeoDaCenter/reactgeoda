const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const KeplerPackage = require('../../csds_kepler/package.json');

const resolve = require('path').resolve;

module.exports = (env) => {
  console.log('env', env);
  return {
    entry: {
      app: env.ai ? './src/ai.js' : './src/main.js',
    },
    output: {
      path: path.join(__dirname, '/out'),
      filename: 'bundle.js',
    },
    devtool: 'source-map',
    devServer: {
      // static: './out',
      static: path.join(__dirname, 'public'),
      // publicPath: '/',
      // port: 4001,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template:
          env.ai 
            ? 'ai.html'
            : env === 'geoda'
            ? 'geoda.html'
            : 'index.html',
      }),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_DEBUG: false,
        },
      }),
      new webpack.EnvironmentPlugin([
        'NEXT_PUBLIC_MAPBOX_TOKEN',
        'EnableLogger',
      ]),
    ],
    resolve: {
      extensions: ['.js', '.tsx', '.ts'],
      modules: ['node_modules', resolve(__dirname, '../../csds_kepler/src')],
      alias: {
        'apache-arrow': resolve(
          __dirname,
          '../geoda-ai/node_modules/apache-arrow'
        ),
        tailwindcss: resolve(__dirname, './node_modules/tailwindcss'),
        '@nextui-org/react': resolve(
          __dirname,
          './node_modules/@nextui-org/react'
        ),
        react: resolve(__dirname, './node_modules/react'),
        'react-dom': resolve(__dirname, './node_modules/react-dom'),
        'react-redux': resolve(
          __dirname,
          '../geoda-ai/node_modules/react-redux'
        ),
        'styled-components': resolve(
          __dirname,
          '../geoda-ai/node_modules/styled-components'
        ),
        'react-intl': resolve(__dirname, '../geoda-ai/node_modules/react-intl'),
        'react-virtualized-auto-sizer': resolve(
          __dirname,
          '../geoda-ai/node_modules/react-virtualized-auto-sizer'
        ),
        '@kepler.gl/reducers': resolve(
          __dirname,
          '../../csds_kepler/src/reducers/src'
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
        'kepler.gl': resolve(__dirname, '../../csds_kepler/src'),
        '@loaders.gl/arrow': resolve(
          __dirname,
          '../../loaders.gl/modules/arrow/src'
        ),
        '@loaders.gl/core': resolve(
          __dirname,
          '../../loaders.gl/modules/core/src'
        ),
        '@loaders.gl/csv': resolve(
          __dirname,
          '../../loaders.gl/modules/csv/src'
        ),
        '@loaders.gl/gis': resolve(
          __dirname,
          '../../loaders.gl/modules/gis/src'
        ),
        '@loaders.gl/gltf': resolve(
          __dirname,
          '../../loaders.gl/modules/gltf/src'
        ),
        '@loaders.gl/json': resolve(
          __dirname,
          '../../loaders.gl/modules/json/src'
        ),
        '@loaders.gl/loader-utils': resolve(
          __dirname,
          '../../loaders.gl/modules/loader-utils/src'
        ),
        '@loaders.gl/schema': resolve(
          __dirname,
          '../../loaders.gl/modules/schema/src'
        ),
        '@loaders.gl/shapefile': resolve(
          __dirname,
          '../../loaders.gl/modules/shapefile/src'
        ),
        '@loaders.gl/wkt': resolve(
          __dirname,
          '../../loaders.gl/modules/wkt/src'
        ),
        '@loaders.gl/parquet': resolve(
          __dirname,
          '../../loaders.gl/modules/parquet/src'
        ),
        '@loaders.gl/polyfill': resolve(
          __dirname,
          '../../loaders.gl/modules/polyfill/src'
        ),
        '@webgeoda': resolve(__dirname, '../geoda-ai/src'),
        '@/hooks': resolve(__dirname, '../geoda-ai/src/hooks'),
        '@/actions': resolve(__dirname, '../geoda-ai/src/actions'),
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|ts|tsx)$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          include: [
            resolve(__dirname, './src'),
            resolve(__dirname, '../geoda-ai/src'),
            resolve(__dirname, '../../csds_kepler/src'),
            resolve(__dirname, '../../loaders.gl/modules/arrow/src'),
            resolve(__dirname, '../../loaders.gl/modules/core/src'),
            resolve(__dirname, '../../loaders.gl/modules/csv/src'),
            resolve(__dirname, '../../loaders.gl/modules/gis/src'),
            resolve(__dirname, '../../loaders.gl/modules/gltf/src'),
            resolve(__dirname, '../../loaders.gl/modules/json/src'),
            resolve(__dirname, '../../loaders.gl/modules/wkt/src'),
            resolve(__dirname, '../../loaders.gl/modules/schema/src'),
            resolve(__dirname, '../../loaders.gl/modules/loader-utils/src'),
            resolve(__dirname, '../../loaders.gl/modules/parquet/src'),
          ],
          options: {
            presets: [
              '@babel/preset-env',
              // for Babel and React 17, adding runtime automatic
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript',
            ],
            plugins: [
              [
                '@babel/plugin-transform-typescript',
                { isTSX: true, allowDeclareFields: true },
              ],
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-proposal-optional-chaining',
              '@babel/plugin-proposal-export-namespace-from',
              '@babel/plugin-transform-runtime',
              [
                'search-and-replace',
                {
                  rules: [
                    {
                      search: '__PACKAGE_VERSION__',
                      replace: KeplerPackage.version,
                    },
                  ],
                },
              ],
            ],
          },
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: ['style-loader', 'css-loader', 'sass-loader', 'postcss-loader'],
        },
        {
          test: /\.(png|woff|woff2|eot|ttf|svg)$/,
          loader: 'url-loader',
          options: { limit: false },
        },
        // for compiling apache-arrow, @nextui-org/react ESM module
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto',
        },
      ],
    },
  };
};
