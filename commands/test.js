module.exports = {
  command: 'test',
  describe: 'run unit tests',

  builder(yargs) {
    return yargs
      .option('watch', {
        alias: 'w',
        default: false,
        type: 'boolean',
      })
  },

  execute(config, argv) {
    return require('genesis-core').test(config)
  },
}
