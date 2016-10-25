module.exports = {
  command: 'build',
  describe: 'build the app',

  builder(yargs) {
    const configSchema = require('../lib/config-schema')

    return yargs
      .option('v', {
        alias: 'verbose',
        default: false,
        describe: 'Output more information',
      })
      .group(['s'], 'Compiler:')
      .option('s', {
        alias: 'sourcemaps',
        default: configSchema.compiler_sourcemaps.default,
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
        const config = getConfig({ defaultEnv: 'production' })
        const { __PROD__, __STAG__ } = config.compiler_globals

        const webpackConfig = getWebpackConfig(config, {
          hmr: false,
          splitBundle: true,
          minify: __PROD__ || __STAG__,
        })

        fs.removeSync(config.compiler_dist)

        if (argv.verbose) {
          log('Building...')
        } else {
          log.info('Run with --verbose to see more output')
          log.spin('Building')
        }

        return build(webpackConfig)
          .then(stats => {
            const message = `Built to ${chalk.gray(config.compiler_dist)}`

            // soft errors
            if (stats.hasErrors()) {
              log.error(stats.toString(config.compiler_stats))
              throw new Error('Build had errors')
            }

            // warnings
            if (stats.hasWarnings()) {
              log.error(stats.toString(config.compiler_stats))

              if (config.compiler_fail_on_warning) {
                throw new Error('Unexpected build warnings')
              }
            }

            // success
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
