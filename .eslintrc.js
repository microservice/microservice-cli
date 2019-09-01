module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: ['airbnb-base', 'prettier', 'plugin:@typescript-eslint/recommended'],
  plugins: ['@typescript-eslint', 'prettier'],

  rules: {
    'prettier/prettier': 'off',
    // ^ Let the prettier CLI handle these.
    'no-use-before-define': 'off',
    // ^ Replaced by typescript-eslint
    'no-unused-vars': 'off',
    // ^ Replaced by typescript-eslint
    '@typescript-eslint/indent': 'off',
    // ^ Conflicts with Prettier
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/member-delimiter-style': 'off',
    'import/no-unresolved': 'off',
    // ^ Let the IDE handle shaming for these three
    'import/prefer-default-export': 'off',
    // ^ Noisy and not particularly useful
    'lines-between-class-members': 'off',
    'no-underscore-dangle': 'warn',
    '@typescript-eslint/explicit-member-accessibility': 'warn',
    '@typescript-eslint/camelcase': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
  },
  env: {
    jest: true,
    node: true,
  },
}
