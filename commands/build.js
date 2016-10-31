const debug = require('debug')('genesis:commands:build')

module.exports = {
  command: 'build',
  describe: 'build the app',

  builder(yargs) {
    const configSchema = require('../lib/config-schema')

    return yargs
      .default('env', 'production')
      .option('v', {
        alias: 'verbose',
        default: false,
        describe: 'Output more information',
      })
      .group(['s'], 'Compiler:')
      .option('s', {
        alias: 'sourcemaps',
        describe: configSchema.compiler_sourcemaps.describe,
        type: configSchema.compiler_sourcemaps.type,
      })
  },

  execute(argv) {
    const build = require('../bin/build')
    const chalk = require('chalk')
    const getConfig = require('../lib/get-config')
    const getWebpackConfig = require('../lib/get-webpack-config')
    const fs = require('fs-promise')
    const log = require('../lib/log')
    const validators = require('../lib/validators')

    return Promise.resolve()
      .then(validators.projectStructure)
      .then(() => {
        const config = getConfig(argv.config, {
          compiler_env: argv.env,
          compiler_sourcemaps: argv.sourcemaps,
        })
        const { __PROD__, __STAG__ } = config.compiler_globals
        const webpackConfig = getWebpackConfig(config, {
          coverage: false,
          hmr: false,
          splitBundle: true,
          minify: __PROD__ || __STAG__,
        })

        if (argv.verbose) {
          log('Building...')
        } else {
          log.info('Run with --verbose to see more output')
          log.spin('Building')
        }

        debug(`Removing ${config.compiler_dist}`)
        fs.removeSync(config.compiler_dist)

        return build(webpackConfig)
          .then(stats => {
            const hasErrors = stats.hasErrors()
            const hasWarnings = stats.hasWarnings()
            debug(`Built with ${!hasErrors ? 'no' : ' '}errors and ${!hasWarnings ? 'no' : ' '}warnings`)

            // soft errors
            if (hasErrors) {
              log.error(stats.toString(config.compiler_stats))
              throw new Error('Build had errors')
            }

            // warnings
            if (hasWarnings) {
              log.error(stats.toString(config.compiler_stats))

              if (config.compiler_fail_on_warning) {
                throw new Error('Unexpected build warnings')
              }
            }

            // success
            const message = `Built to ${chalk.gray(config.compiler_dist)}`
            if (argv.verbose) {
              log(stats.toString(config.compiler_stats))
              log.success(message)
            } else {
              log.spinSucceed(message)
            }
          })
      })
  },
}
