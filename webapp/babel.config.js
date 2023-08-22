const {resolve} = require('path');
const KeplerPackage = require('./kepler.gl/package.json');

module.exports = function babel(api) {
  api.cache(true);
  console.log(KeplerPackage.version);
  return {
    presets: [['next/babel', {'preset-env': {}}]],
    plugins: [
      ['@babel/plugin-transform-typescript', {allowDeclareFields: true, isTSX: true}],
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
      ],
      [
        'babel-plugin-module-resolver',
        {
          alias: {
            // '@kepler.gl/reducers': resolve(__dirname, './kepler.gl/src/reducers/src/index'),
            // '@kepler.gl/actions': resolve(__dirname, './kepler.gl/src/actions/src/index'),
            // '@kepler.gl/constants': resolve(__dirname, './kepler.gl/src/constants/src/index'),
            // '@kepler.gl/components': resolve(__dirname, './kepler.gl/src/components/src/index'),
            // '@kepler.gl/utils': resolve(__dirname, './kepler.gl/src/utils/src/index'),
            // '@kepler.gl/styles': resolve(__dirname, './kepler.gl/src/styles/src/index'),
            // '@kepler.gl/types': resolve(__dirname, './kepler.gl/src/types/index'),
            // '@kepler.gl/localization': resolve(__dirname, './kepler.gl/src/localization/src/index'),
            // '@kepler.gl/layers': resolve(__dirname, './kepler.gl/src/layers/src/index'),
            // '@kepler.gl/table': resolve(__dirname, './kepler.gl/src/table/src/index'),
            // '@kepler.gl/tasks': resolve(__dirname, './kepler.gl/src/tasks/src/index'),
            // '@kepler.gl/schemas': resolve(__dirname, './kepler.gl/src/schemas/src/index'),
            // '@kepler.gl/deckgl-layers': resolve(
            //   __dirname,
            //   './kepler.gl/src/deckgl-layers/src/index'
            // ),
            // '@kepler.gl/cloud-providers': resolve(
            //   __dirname,
            //   './kepler.gl/src/cloud-providers/src/index'
            // ),
            // '@kepler.gl/processors': resolve(__dirname, './kepler.gl/src/processors/src/index')
          }
        }
      ]
    ]
  };
};
