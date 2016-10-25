/**
 * Returns a Webpack config.
 * @param {object} config - A valid Genesis config object
 * @param {object} options - High level configuration options.
 * @param {boolean} options.hmr - Whether or not to enable hot module replacement.
 * @param {boolean} options.minify - Minify the bundle.
 * @param {boolean} options.splitBundle - Split into app and vendor bundles.
 * @returns {object} A valid Webpack configuration.
 */
module.exports = function getWebpackConfig(config, options) {
  const cssnano = require('cssnano')
  const debug = require('debug')('genesis:get-webpack-config')
  const ExtractTextPlugin = require('extract-text-webpack-plugin')
  const HtmlWebpackPlugin = require('html-webpack-plugin')
  const paths = require('./paths')
  const validators = require('./validators')
  const webpack = require('webpack')

  debug('With options:', JSON.stringify(options))

  // ------------------------------------
  // Webpack constants (derived from user configuration)
  // ------------------------------------
  // We use an explicit public path in development to resolve this issue:
  // http://stackoverflow.com/questions/34133808/webpack-ots-parsing-error-loading-fonts/34133809#34133809
  const WEBPACK_PUBLIC_PATH = options.hmr
    ? `${config.server_protocol}://${config.server_host}:${config.server_port}/`
    : '/'

  // ======================================================
  // Create Webpack Configuration
  // ======================================================
  const webpackConfig = {
    target: 'web',
    devtool: config.compiler_sourcemaps ? 'source-map' : null,
    resolve: {
      root: paths.cwdSrc(),
      extensions: ['', '.js', '.json'],
      alias: config.compiler_alias,
    },
    module: {
      preLoaders: [],
      loaders: [],
      noParse: config.compiler_noParse,
    },
    plugins: [],
    externals: config.compiler_externals,
    stats: config.compiler_stats,
  }

  // ======================================================
  // Application Entry and Compiler Target Definitions
  // ======================================================
  debug('Entry and output')
  // ----------------------------------
  // Entry Points
  // ----------------------------------
  const APP_ENTRIES = [paths.cwdSrc('main.js')]
  if (options.hmr) {
    APP_ENTRIES.push(`webpack-hot-middleware/client?path=${WEBPACK_PUBLIC_PATH}__webpack_hmr`)
  }
  webpackConfig.entry = {
    app: APP_ENTRIES,
    vendor: [...config.compiler_vendors],
  }

  // ----------------------------------
  // Compiler Target (Dist)
  // ----------------------------------
  const hashType = options.hmr ? 'hash' : 'chunkhash'
  webpackConfig.output = {
    filename: `[name].[${hashType}].js`,
    path: config.compiler_dist,
    publicPath: WEBPACK_PUBLIC_PATH,
    pathinfo: true,
  }

  // ======================================================
  // Loaders
  // ======================================================
  debug('Add loaders')
  // ----------------------------------
  // JavaScript
  // ----------------------------------
  webpackConfig.module.loaders.push({
    test: /\.js$/,
    include: [
      paths.cwdSrc(),
      paths.cwdTest(),
      paths.genLib(),
    ],
    loader: 'babel',
    query: require('./get-babel-config')(),
  })

  // ----------------------------------
  // JSON
  // ----------------------------------
  webpackConfig.module.loaders.push({
    test: /\.json$/,
    loader: 'json',
  })

  // ----------------------------------
  // SCSS
  // ----------------------------------
  webpackConfig.module.loaders.push({
    test: /\.scss$/,
    loaders: [
      'style',
      'css?sourceMap',
      'postcss',
      'sass?sourceMap',
    ],
  })

  webpackConfig.sassLoader = {
    includePaths: paths.cwdSrc('styles'),
  }
  webpackConfig.postcss = [
    cssnano({
      autoprefixer: config.compiler_autoprefixer,
      discardComments: {
        removeAll: true,
      },
      safe: true,
      sourcemap: true,
    }),
  ]

  // ======================================================
  // Plugins
  // ======================================================
  debug('Add plugins')
  webpackConfig.plugins.push(
    new webpack.DefinePlugin(config.compiler_globals),
    new HtmlWebpackPlugin({
      template: paths.cwdSrc('index.html'),
      hash: false,
      favicon: config.compiler_favicon,
      filename: 'index.html',
      inject: 'body',
      minify: {
        collapseWhitespace: true,
      },
    })
  )

  if (options.hmr) {
    debug('Enable plugins for live development (HMR, NoErrors).')
    webpackConfig.plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    )
  }

  if (options.minify) {
    debug('Enable plugins for production (OccurenceOrder, Dedupe & UglifyJS).')
    webpackConfig.plugins.push(
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          unused: true,
          dead_code: true,
          warnings: false,
        },
      })
    )
  }

  // Don't split bundles during testing, since PhantomJS is only
  // smart enough to import one of them.
  if (options.splitBundle) {
    debug('Enable plugins for bundle splitting (CommonsChunkPlugin).')
    webpackConfig.plugins.push(
      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor'],
      })
    )
  }

  // ======================================================
  // Finalize Configuration
  // ======================================================
  debug('Finalize configuration')
  if (!options.hmr) {
    debug('Apply ExtractTextPlugin to CSS loaders.')
    webpackConfig.module.loaders.filter((loader) =>
      loader.loaders && loader.loaders.find((name) => /css/.test(name.split('?')[0]))
    ).forEach((loader) => {
      const first = loader.loaders[0]
      const rest = loader.loaders.slice(1)
      loader.loader = ExtractTextPlugin.extract(first, rest.join('!'))
      delete loader.loaders
    })

    webpackConfig.plugins.push(
      new ExtractTextPlugin('[name].[contenthash].css', {
        allChunks: true,
      })
    )
  }

  // ======================================================
  // Validate
  // ======================================================
  debug('Validate final config')
  validators.webpackConfig(webpackConfig)

  // ======================================================
  // Configuration Complete
  // ======================================================
  debug('Exporting final configuration')

  return webpackConfig
}
