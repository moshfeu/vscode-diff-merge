const config = require('./webpack.config.dev');

module.exports = {
  ...config,
  mode: 'development',
  watch: false,
  devtool: 'inline-source-map',
  entry: {
    test: './src/tests/utils.test.js',
  },
};
