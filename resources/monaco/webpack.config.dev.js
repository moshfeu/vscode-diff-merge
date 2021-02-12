const config = require('./webpack.config');
const merge = require('webpack-merge');

module.exports = merge(config, {
  mode: 'development',
  watch: true,
  devtool: 'inline-source-map',
});
