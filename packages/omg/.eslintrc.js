module.exports = {
  parser: 'typescript-eslint-parser',
  plugins: ['typescript'],
  extends: ['eslint:recommended', 'google'],
  rules: {
    'max-len': 0,
    'no-throw-literal': 0,
    'no-undef': 0,
    'no-unused-vars': 0,
    'quote-props': [2, 'as-needed'],
    indent: ['error', 2, { MemberExpression: 'off', SwitchCase: 1 }],
    semi: 0,
    'comma-dangle': 0,
    'arrow-parens': 0,
    'object-curly-spacing': 0
  },
  env: {
    jest: true,
    node: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module'
  }
}
