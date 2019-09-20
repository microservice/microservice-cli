const { rules, parser, plugins } = require('../../.eslintrc.js')

module.exports = {
  root: true,
  rules,
  parser,
  plugins,
  extends: ['prettier', 'plugin:@typescript-eslint/recommended'],
  env: {
    browser: true,
  },
}
