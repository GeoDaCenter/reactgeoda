module.exports = {
  plugins: ['eslint-plugin-prettier', 'react', 'react-hooks', 'prettier'],
  env: {
    es6: true,
    node: true,
    browser: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@next/next/recommended',
    'plugin:eslint-comments/recommended',
    'plugin:css/recommended',
    // Add "prettier" last. This will turn off eslint rules conflicting with prettier. This is not what will format our code.
    'prettier'
  ],
  rules: {
    'no-duplicate-imports': 'error',
    'prettier/prettier': 'error',
    'react-hooks/exhaustive-deps': 'error'
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
