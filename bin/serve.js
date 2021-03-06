/**
 * Start the dev server
 * @param {object} webpackConfig - Any webpack configuration
 * @param {object} options - Configuration
 * @param {string} options.contentBase - Webpack dev middleware content base
 * @param {object} options.stats - Webpack stats
 * @param {string} options.staticPath - Where to serve static files from
 * @param {number} options.port - The server port
 * @param {string} options.host - The server host
 * @param {boolean} [options.verbose] - Shows the webpack stats output
 * @param {boolean} [options.compilerDone] - Webpack compiler "done" event callback
 * @returns {Promise}
 */
module.exports = function start(webpackConfig, options) {
  return new Promise((resolve, reject) => {
    try {
      /*
       * ============================================================
       * This server currently only uses webpack middleware to server
       * the React application for local development, it is *not*
       * intended for production usage. However, keeping it in ~/server
       * keeps the door open for potential future isomorphic functionality.
       * ============================================================
       */
      const express = require('express')
      const webpack = require('webpack')
      const WebpackDevMiddleware = require('webpack-dev-middleware')
      const WebpackHotMiddleware = require('webpack-hot-middleware')
      const historyApiFallback = require('connect-history-api-fallback')

      const { verbose } = options

      const webpackCompiler = webpack(webpackConfig)
      const app = express()

      const webpackDevMiddleware = WebpackDevMiddleware(webpackCompiler, {
        contentBase: options.contentBase,
        debug: verbose,
        hot: true,
        lazy: false,
        noInfo: !verbose,
        progress: verbose,
        publicPath: webpackConfig.output.publicPath,
        stats: verbose ? options.stats : 'none',
        quiet: !verbose,
      })
      app
        .use(historyApiFallback({ verbose: false }))
        .use(webpackDevMiddleware)
        .use(WebpackHotMiddleware(webpackCompiler))
        .use(express.static(options.staticPath))

      webpackCompiler.plugin('done', options.compilerDone)

      webpackDevMiddleware.waitUntilValid(() => {
        app.listen(options.port, options.host, () => {
          resolve()
        })
      })
    } catch (err) {
      reject(err)
    }
  })
}
