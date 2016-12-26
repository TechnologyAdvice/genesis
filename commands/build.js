module.exports = {
  command: 'build',
  describe: 'compile the application to disk',

  builder(yargs) {
    return yargs
      .option('v', {
        alias: 'verbose',
        default: false,
        describe: 'output more information',
      })
  },

  execute(config, argv) {
    const chalk = require('chalk')
    const log = require('../utils/log')

    return require('genesis-core').compile(config)
      .then(stats => {
        log.webpackStats(stats, config)
        if (stats.hasErrors()) {
          throw new Error('Build had errors')
        }
        if (stats.hasWarnings() && config.compiler_fail_on_warning) {
          throw new Error('Unexpected build warnings')
        }
      })
      .then(() => {
        log.spinSucceed(`Built successfully to ${chalk.gray(config.compiler_dist)}.`)
      })
  },
}
