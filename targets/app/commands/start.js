const chalk = require('chalk')
const serve = require('../../../core/scripts/serve')
const { log, paths } = require('../../../utils')
const getWebpackConfig = require('../../../core/configs/webpack.config')

module.exports = (config) =>
  Promise.resolve()
    .then(() => {
      log('Starting development server...')

      const webpackConfig = getWebpackConfig(config, {
        coverage: false,
        hmr: true,
        minify: false,
        mocks: false,
        splitBundle: true,
      })
      return serve(webpackConfig, {
        compilerDone(stats) {
          if (stats.hasErrors()) {
            log.error(stats.toString('errors-only'))
            log.error('App failed to build, see errors above.')
          } else if (stats.hasWarnings()) {
            log.warn(stats.toString('errors-only'))
            log.warn('App built with warnings, see above.')
          } else {
            if (argv.verbose) log(stats.toString(config.compiler_stats))
            log.success('App built successfully.')
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
          log.success(`The server is now running at ${chalk.green(location)}.`)
        })
    })
}
