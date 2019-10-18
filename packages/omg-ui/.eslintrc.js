module.exports = {
  parser: 'vue-eslint-parser',
  extends: ['plugin:vue/recommended'],
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
        optionalDependencies: false,
      },
    ],
  },
  env: {
    browser: true,
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
}
