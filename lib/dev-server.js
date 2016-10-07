const chalk = require('chalk')
const express = require('express')
const path = require('path')
const webpack = require('webpack')
const WebpackDevMiddleware = require('webpack-dev-middleware')
const WebpackHotMiddleware = require('webpack-hot-middleware')
const historyApiFallback = require('connect-history-api-fallback')

/**
 * Start the dev server
 * @param {object} [options] Optional configuration
 * @param {boolean} [options.verbose] Shows the webpack stats output
 * @returns {Promise}
 */
exports.start = (options) => new Promise((resolve, reject) => {
  const { config } = require('./context').get()
  const webpackConfig = require('./webpack-config')
  /*
   * ============================================================
   * This server currently only uses webpack middleware to server
   * the React application for local development, it is *not*
   * intended for production usage. However, keeping it in ~/server
   * keeps the door open for potential future isomorphic functionality.
   * ============================================================
   */
  const { verbose } = options

  const webpackCompiler = webpack(webpackConfig)
  const app = express()
  let isListening = false

  app
    .use(historyApiFallback({ verbose: false }))
    .use(WebpackDevMiddleware(webpackCompiler, {
      publicPath: webpackConfig.output.publicPath,
      contentBase: path.resolve(process.cwd(), config.compiler_src),
      hot: true,
      quiet: !verbose,
      noInfo: !verbose,
      lazy: false,
      stats: verbose && config.compiler_stats,
    }))
    .use(WebpackHotMiddleware(webpackCompiler))
    .use(express.static(path.resolve(process.cwd(), config.compiler_assets)))

  const listen = () => {
    isListening = true
    app.listen(config.server_port, config.server_host, () => {
      const location = chalk.green(`${config.server_protocol}://${config.server_host}:${config.server_port}`)
      resolve(`The app is running at ${location}`)
    })
  }

  webpackCompiler.plugin('done', (stats) => {
    if (!isListening) listen()
  })
})
