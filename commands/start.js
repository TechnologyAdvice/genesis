const debug = require('debug')('genesis:commands:start')

module.exports = {
  command: 'start',
  describe: 'start the dev server',

  builder(yargs) {
    const configSchema = require('../lib/config-schema')

    return yargs
      .default('env', 'development')
      .group(['h', 'p'], 'Server:')
      .option('p', {
        alias: 'port',
        default: configSchema.server_port.default,
        describe: configSchema.server_port.describe,
        type: configSchema.server_port.type,
      })
      .option('h', {
        alias: 'host',
        default: configSchema.server_host.default,
        describe: configSchema.server_host.describe,
        type: configSchema.server_host.type,
      })
      .option('v', {
        alias: 'verbose',
        default: false,
        describe: 'Output more information',
      })
  },

  execute(argv) {
    const chalk = require('chalk')
    const getConfig = require('../lib/get-config')
    const log = require('../lib/log')
    const paths = require('../lib/paths')
    const serve = require('../bin/serve')
    const validators = require('../lib/validators')
    const getWebpackConfig = require('../lib/get-webpack-config')

    const { verbose } = argv

    return Promise.resolve()
      .then(validators.projectStructure)
      .then(() => {
        const config = getConfig(argv.config, {
          compiler_env: argv.env,
          server_port: argv.port,
          server_host: argv.host,
        })

        const webpackConfig = getWebpackConfig(config, {
          hmr: true,
          minify: false,
          splitBundle: true,
        })

        if (!verbose) log.info('Run with --verbose to see more output')
        log('Starting server...')

        return serve(webpackConfig, {
          verbose,
          contentBase: paths.cwdSrc(),
          stats: config.compiler_stats,
          staticPath: paths.cwdAssets(),
          port: config.server_port,
          host: config.server_host,
        })
          .then((stats) => {
            const hasErrors = stats.hasErrors()
            const hasWarnings = stats.hasWarnings()
            debug(`Built with ${!hasErrors ? 'no' : ' '}errors and ${!hasWarnings ? 'no' : ' '}warnings`)

            // soft errors (always log, ignore verbose)
            if (hasErrors) {
              log.error(stats.toString(config.compiler_stats))
              throw new Error('Failed to start the app.  See build errors above.')
            }

            // warnings
            if (hasWarnings) {
              if (verbose) {
                log.warn(stats.toString(config.compiler_stats))
              } else {
                log.warn('Built with warnings, use --verbose for more info.')
              }

              if (config.compiler_fail_on_warning) {
                throw new Error('Unexpected build warnings')
              }
            }

            // success
            if (argv.verbose) {
              log(stats.toString(config.compiler_stats))
            }
            const location = `${config.server_protocol}://${config.server_host}:${config.server_port}`
            log.success(`The app is running at ${chalk.green(location)}`)
          })
      })
  },
}
