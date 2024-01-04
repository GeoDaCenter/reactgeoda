const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const KeplerPackage = require('../../csds_kepler/package.json');

const resolve = require('path').resolve;

module.exports = env => {
  return {
    entry: {
      app: resolve('./src/main.js')
    },
    output: {
      path: path.join(__dirname, '/out'),
      filename: 'bundle.js'
    },
    devtool: 'source-map',
    plugins: [
      new HtmlWebpackPlugin({
        template: env == 'geoda' ? 'geoda.html' : 'index.html'
      }),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_DEBUG: false
        }
      }),
      new webpack.EnvironmentPlugin(['NEXT_PUBLIC_MAPBOX_TOKEN', 'EnableLogger'])
    ],
    devServer: {
      contentBase: path.join(__dirname, 'public'),
      publicPath: '/',
      port: 4001
    },
    resolve: {
      extensions: ['.js', '.tsx', '.ts'],
      modules: ['node_modules', resolve(__dirname, '../../csds_kepler/src')],
      alias: {
        'apache-arrow': resolve(__dirname, '../webapp/node_modules/apache-arrow'),
        '@kepler.gl/reducers': resolve(__dirname, '../../csds_kepler/src/reducers/src'),
        '@kepler.gl/actions': resolve(__dirname, '../../csds_kepler/src/actions/src/index'),
        '@kepler.gl/constants': resolve(__dirname, '../../csds_kepler/src/constants/src/index'),
        '@kepler.gl/components': resolve(__dirname, '../../csds_kepler/src/components/src/index'),
        '@kepler.gl/utils': resolve(__dirname, '../../csds_kepler/src/utils/src/index'),
        '@kepler.gl/styles': resolve(__dirname, '../../csds_kepler/src/styles/src/index'),
        '@kepler.gl/types': resolve(__dirname, '../../csds_kepler/src/types'),
        '@kepler.gl/localization': resolve(
          __dirname,
          '../../csds_kepler/src/localization/src/index'
        ),
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
        'kepler.gl': resolve(__dirname, '../../csds_kepler/src'),
        react: resolve(__dirname, '../webapp/node_modules/react'),
        'react-dom': resolve(__dirname, '../webapp/node_modules/react-dom'),
        'react-redux': resolve(__dirname, '../webapp/node_modules/react-redux/lib'),
        'styled-components': resolve(__dirname, '../webapp/node_modules/styled-components'),
        'react-intl': resolve(__dirname, '../webapp/node_modules/react-intl'),
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
        // '@loaders.gl/polyfill': resolve(__dirname, '../../loaders.gl/modules/polyfill/src'),
        '@webgeoda': resolve(__dirname, '../webapp/src')
      }
    },
    module: {
      rules: [
        {
          test: /\.(js|ts|tsx)$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          include: [
            resolve(__dirname, './src'),
            resolve(__dirname, '../webapp/src'),
            resolve(__dirname, '../../csds_kepler/src'),
            resolve(__dirname, '../../loaders.gl/modules/arrow/src'),
            resolve(__dirname, '../../loaders.gl/modules/core/src'),
            resolve(__dirname, '../../loaders.gl/modules/gis/src'),
            resolve(__dirname, '../../loaders.gl/modules/gltf/src'),
            resolve(__dirname, '../../loaders.gl/modules/json/src'),
            resolve(__dirname, '../../loaders.gl/modules/wkt/src'),
            resolve(__dirname, '../../loaders.gl/modules/schema/src'),
            resolve(__dirname, '../../loaders.gl/modules/loader-utils/src'),
            resolve(__dirname, '../../loaders.gl/modules/parquet/src')
          ],
          options: {
            presets: [
              '@babel/preset-env',
              // for Babel and React 17, adding runtime automatic
              ['@babel/preset-react', {runtime: 'automatic'}],
              '@babel/preset-typescript'
            ],
            plugins: [
              ['@babel/plugin-transform-typescript', {isTSX: true, allowDeclareFields: true}],
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
                      replace: KeplerPackage.version
                    }
                  ]
                }
              ]
            ]
          }
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: ['style-loader', 'css-loader', 'sass-loader']
        },
        {
          test: /\.(png|woff|woff2|eot|ttf|svg)$/,
          loader: 'url-loader',
          options: {limit: false}
        },
        // for compiling apache-arrow ESM module
        {
          test: /\.mjs$/,
          include: /node_modules\/apache-arrow/,
          type: 'javascript/auto'
        }
      ]
    }
  };
};
