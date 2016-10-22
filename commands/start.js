module.exports = {
  command: 'start',
  describe: 'start the dev server',

  builder(yargs) {
    const configSchema = require('../lib/config-schema')

    return yargs
      .group(['h', 'p'], 'Server:')
      .option('p', {
        alias: 'port',
        default: configSchema.server_port.default,
        describe: configSchema.server_port.describe,
        type: configSchema.server_port.type,
      })
      .option('h', {
        alias: 'port',
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
        const config = getConfig({ defaultEnv: 'development' })
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
          .then(() => {
            const location = `${config.server_protocol}://${config.server_host}:${config.server_port}`
            log.success(`The app is running at ${chalk.green(location)}`)
          })
      })
  },
}
