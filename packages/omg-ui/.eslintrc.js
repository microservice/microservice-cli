const { rules, parser, plugins } = require('../../.eslintrc.js')

module.exports = {
  root: true,
  rules,
  parser,
  plugins,
  extends: ['airbnb/hooks', 'prettier', 'plugin:@typescript-eslint/recommended', 'plugin:react/recommended'],
  env: {
    browser: true,
  },
  settings: {
    react: {
      version: '16.9.0',
    },
  },
}
