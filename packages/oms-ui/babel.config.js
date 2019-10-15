module.exports = {
  presets: ['@vue/app'],
  plugins: [
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
