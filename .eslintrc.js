module.exports = {
  plugins: ['@typescript-eslint', 'eslint-plugin-prettier', 'react', 'react-hooks', 'prettier'],
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
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'valid-jsdoc': 0,
    'consistent-return': 0,
    'no-duplicate-imports': 'error',
    'react-hooks/exhaustive-deps': 'error',
    '@next/next/no-html-link-for-pages': ['error', 'src/pages/'],
    'prettier/prettier': 'error'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  settings: {
    next: {
      rootDir: './webapp/'
    }
  },
  ignorePatterns: ['kepler.gl', 'node_modules', 'out']
};
