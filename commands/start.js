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
        describe: configSchema.server_port.describe,
        type: configSchema.server_port.type,
      })
      .option('h', {
        alias: 'host',
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

    return Promise.resolve()
      .then(validators.projectStructure)
      .then(() => {
        const config = getConfig(argv.config, {
          compiler_env: argv.env,
          server_port: argv.port,
          server_host: argv.host,
        })

        const webpackConfig = getWebpackConfig(config, {
          coverage: false,
          hmr: true,
          minify: false,
          mocks: false,
          splitBundle: true,
        })

        if (!argv.verbose) log.info('Run with --verbose to see more output')
        log('Starting server...')

        return serve(webpackConfig, {
          compilerDone(stats) {
            const hasErrors = stats.hasErrors()
            const hasWarnings = stats.hasWarnings()

            if (hasErrors) {
              log.error(stats.toString('errors-only'))
              log.error('App failed to build, see errors above.')
            } else if (hasWarnings) {
              log.warn(stats.toString('errors-only'))
              log.warn('App built with warnings, see above.')
            } else {
              if (argv.verbose) log(stats.toString(config.compiler_stats))
              log.success('App built successfully')
            }
          },
          verbose: argv.verbose,
          contentBase: paths.cwdSrc(),
          stats: config.compiler_stats,
          staticPath: paths.cwdAssets(),
          port: config.server_port,
          host: config.server_host,
        })
          .then((stats) => {
            const location = `${config.server_protocol}://${config.server_host}:${config.server_port}`
            log.success(`The server is running at ${chalk.green(location)}`)
          })
      })
  },
}
