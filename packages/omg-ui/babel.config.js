module.exports = {
  presets: [
    '@emotion/babel-preset-css-prop',
    '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        targets: {
          node: 8,
        },
      },
    ],
  ],
  plugins: [
    'babel-plugin-emotion',
    '@babel/plugin-proposal-class-properties',
    [
      'module-resolver',
      {
        root: ['.'],
        alias: {
          '~': './src',
        },
      },
    ],
  ],
}
