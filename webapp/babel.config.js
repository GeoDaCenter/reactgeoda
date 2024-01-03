module.exports = function babel(api) {
  api.cache(true);
  return {
    presets: [['next/babel', {'preset-env': {}}]],
    plugins: [
      ['@babel/plugin-transform-typescript', {allowDeclareFields: true, isTSX: true}]
      // [
      //   'search-and-replace',
      //   {
      //     rules: [
      //       {
      //         search: '__PACKAGE_VERSION__',
      //         replace: KeplerPackageVersion
      //       }
      //     ]
      //   }
      // ]
    ]
  };
};
