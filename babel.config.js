const {resolve} = require('path');

const ES6_TARGETS = {
  chrome: '79',
  edge: '79',
  firefox: '68',
  safari: '12',
  ios: '13',
  node: '16'
};

module.exports = {
  presets: [
    // [
    //   'next/babel',
    //   {
    //     'preset-env': {},
    //     'transform-runtime': {},
    //     'styled-jsx': {},
    //     'class-properties': {}
    //   }
    // ],
    // [
    //   '@babel/env',
    //   {
    //     targets: ES6_TARGETS,
    //     // modules: false,
    //     exclude: ['@babel/plugin-transform-regenerator']
    //   }
    // ],
    // '@babel/preset-react',
    // '@babel/preset-typescript'
  ],
  plugins: [
    // [
    //   '@babel/plugin-transform-typescript',
    //   {
    //     allowDeclareFields: true
    //   }
    // ],
    // '@babel/plugin-transform-modules-commonjs',
    // [
    //   '@babel/plugin-transform-react-jsx',
    //   {
    //     runtime: 'automatic'
    //   }
    // ],
    [
      'module-resolver',
      {
        extensions: ['.js', '.ts', '.tsx'],
        root: ['./'],
        alias: {
          '^@kepler.gl/(.+)': './kepler.gl/src/\\1/src/index',
          '@kepler.gl/actions/*': './kepler.gl/src/actions/*',
          '@kepler.gl/actions': './kepler.gl/src/actions/index'
        }
      }
    ]
  ]
};
