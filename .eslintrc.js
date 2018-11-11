module.exports = {
  parser: 'typescript-eslint-parser',
  plugins: [
    'typescript',
  ],
  extends: [
    'eslint:recommended',
    'google',
  ],
  rules: {
    'max-len': 0,
    'no-throw-literal': 0,
    'quote-props': [
      2,
      'as-needed',
    ],
    indent: ['error', 2, {MemberExpression: 1, SwitchCase: 1}],
  },
  env: {
    jest: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
  },
};
