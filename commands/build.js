const fs = require('fs-promise')
const debug = require('debug')('genesis:command:build')
const log = require('../lib/log')

module.exports = {
  command: 'build',
  describe: 'Build the app',

  builder(yargs) {
    return yargs
      .option('verbose', {
        default: false,
        describe: 'Output more information',
      })
      .alias({
        v: 'verbose',
      })
  },

  handler(argv) {
    debug('Executing')
    if (!process.env.NODE_ENV) {
      log.info('Setting default NODE_ENV=production')
      process.env.NODE_ENV = 'production'
    }

    if (!process.env.APP_ENV) {
      log.info('Setting default APP_ENV=production')
      process.env.APP_ENV = 'production'
    }

    const { verbose } = argv
    const config = require('../lib/config')
    const validators = require('../lib/validators')

    validators.validateProject()

    log(`Removing ${config.compiler_dist}`)
    fs.removeSync(config.compiler_dist)

    log('Starting webpack...')
    const build = require('../bin/build')
    const webpackConfig = require('../lib/webpack-config')

    build(webpackConfig)
      .then(stats => {
        log.success('Webpack finished')
        if (verbose) {
          log(stats.toString(config.compiler_stats))
        } else {
          log('Run with --verbose to see more output')
        }
      }, ({ err, stats }) => {
        // fatal error
        if (err) throw err

        // soft errors
        if (stats.hasErrors()) {
          log.error(stats.toString(config.compiler_stats))
          process.exit(1)
        }

        // warnings
        if (stats.hasWarnings()) {
          log.error(stats.toString(config.compiler_stats))

          if (config.compiler_fail_on_warning) {
            process.exit(1)
          }
        }
      })
  },
}
