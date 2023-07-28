module.exports = {
  plugins: ['eslint-plugin-prettier'],
  env: {
    es6: true
  },
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:eslint-comments/recommended',
    'plugin:css/recommended',
    // Add "prettier" last. This will turn off eslint rules conflicting with prettier. This is not what will format our code.
    'prettier'
  ],
  rules: {
    'prettier/prettier': 'error'
  }
};
