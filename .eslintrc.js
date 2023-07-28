module.exports = {
  plugins: ['eslint-plugin-prettier', 'react'],
  env: {
    es6: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:eslint-comments/recommended',
    'plugin:css/recommended',
    // Add "prettier" last. This will turn off eslint rules conflicting with prettier. This is not what will format our code.
    'prettier'
  ],
  rules: {
    'prettier/prettier': 'error'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  }
};
