const path = require('path'),
      debug = require('debug')('ta:server'),
      express = require('express'),
      webpack = require('webpack'),
      config = require('../config')
      webpackConfig = require('../webpack/webpack.config'),
      WebpackDevMiddleware = require('webpack-dev-middleware'),
      WebpackHotMiddleware = require('webpack-hot-middleware'),
      historyApiFallback = require('connect-history-api-fallback'),

/*-------------------------------------
[ NOTE ]
This server currently only uses webpack middleware to server
the React application for local development, it is *not*
intended for production usage. However, keeping it in ~/server
keeps the door open for potential future isomorphic functionality.
-------------------------------------*/
debug('Bootstrap express server')
const app = express()

debug('Enable history api fallback and static middlewares')
app.use(express.static(path.resolve(process.cwd(), 'src/assets')))
app.use(historyApiFallback({ verbose: false }))

debug('Create webpack configuration for dev middleware')
const webpackCompiler = webpack(webpackConfig)

debug('Enable webpack dev and HMR middleware')
app.use(WebpackDevMiddleware(webpackCompiler, {
  publicPath: webpackConfig.output.publicPath,
  contentBase: path.resolve(process.cwd(), 'src'),
  hot: true,
  quiet: false,
  noInfo: false,
  lazy: false,
  stats: config.compiler_stats,
}))
app.use(WebpackHotMiddleware(webpackCompiler))

app.start = () => {
  app.listen(config.server_port, config.server_host, () => {
    debug(`Server is now running at ${config.server_host}:${config.server_port}.`)
  })
}

module.exports = exports = app
