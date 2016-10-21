const cssnano = require('cssnano')
const debug = require('debug')('ta:webpack:config')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const paths = require('./paths')
const webpack = require('webpack')

const config = require('./config')

const { __DEV__, __STAGING__, __PROD__, __TEST__ } = config.compiler_globals

// ------------------------------------
// Webpack constants (derived from user configuration)
// ------------------------------------
// We use an explicit public path in development to resolve this issue:
// http://stackoverflow.com/questions/34133808/webpack-ots-parsing-error-loading-fonts/34133809#34133809
const WEBPACK_PUBLIC_PATH = __DEV__
  ? `${config.server_protocol}://${config.server_host}:${config.server_port}/`
  : '/'

// ======================================================
// Create Webpack Configuration
// ======================================================
const webpackConfig = {
  name: 'client',
  target: 'web',
  devtool: config.compiler_devtool ? 'source-map' : null,
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
}

// ======================================================
// Application Entry and Compiler Target Definitions
// ======================================================
// ----------------------------------
// Entry Points
// ----------------------------------
const APP_ENTRIES = [paths.cwdSrc('main.js')]
if (__DEV__) {
  APP_ENTRIES.push(`webpack-hot-middleware/client?path=${WEBPACK_PUBLIC_PATH}__webpack_hmr`)
}
webpackConfig.entry = {
  app: APP_ENTRIES,
  vendor: [...config.compiler_vendors],
}

// ----------------------------------
// Compiler Target (Dist)
// ----------------------------------
const hashType = __DEV__ ? 'hash' : 'chunkhash'
webpackConfig.output = {
  filename: `[name].[${hashType}].js`,
  path: paths.cwdDist(),
  publicPath: WEBPACK_PUBLIC_PATH,
  pathinfo: true,
}

// ======================================================
// Loaders
// ======================================================
// ----------------------------------
// JavaScript
// ----------------------------------
webpackConfig.module.loaders.push({
  test: /\.js$/,
  exclude: /node_modules/,
  loader: 'babel',
  query: require('./_babel-config').__DO_NOT_CHANGE_OR_YOU_WILL_BE_FIRED__,
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

if (__DEV__) {
  debug('Enable plugins for live development (HMR, NoErrors).')
  webpackConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  )
}

if (__STAGING__ || __PROD__) {
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
if (!__TEST__) {
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
if (!__DEV__) {
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
// Configuration Complete
// ======================================================
debug('Exporting final configuration')
module.exports = webpackConfig
