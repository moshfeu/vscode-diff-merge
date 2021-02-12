const { spawn } = require('child_process');
const config = require('./webpack.config.test');
const { scripts } = require('./package.json');

module.exports = {
  ...config,
  watch: true,
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.afterCompile.tap('jest', () => {
          const [command, ...args] = scripts.mocha.split(/ /g);
          spawn(command, args, { stdio: 'inherit' });
        });
      },
    },
  ],
};
