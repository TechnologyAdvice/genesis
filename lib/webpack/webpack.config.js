const path = require('path'),
      debug = require('debug')('ta:webpack:config'),
      config = require('../config')
      cssnano = require('cssnano'),
      webpack = require('webpack'),
      HtmlWebpackPlugin = require('html-webpack-plugin'),
      ExtractTextPlugin = require('extract-text-webpack-plugin')

// ========================================================
// Environment Helpers
// ========================================================
const NODE_ENV = process.env.NODE_ENV || 'development'
const __DEV__  = NODE_ENV === 'development'
const __TEST__ = NODE_ENV === 'test'
const __PROD__ = NODE_ENV === 'production'

// Ensure that process.env.NODE_ENV and __{{ENV}}__ helpers are available
// even if the user does not define them.
const g = config.compiler_globals
g.__DEV__ = g.__DEV__ || __DEV__
g.__TEST__ = g.__TEST__ || __TEST__
g.__PROD__ = g.__PROD__ || __PROD__
g.__REPORT_COVERAGE__ = g.___REPORT_COVERAGE__ || !!config.coverage_enabled
g.process = g.process || {}
g.process.env = g.process.env || {}
g.process.env.NODE_ENV = g.process.env.NODE_ENV || JSON.stringify(NODE_ENV)

// File system path helpers
const CWD = process.cwd()
const ABSOLUTE_SRC_PATH = path.resolve(CWD, config.compiler_src)
const ABSOLUTE_DIST_PATH = path.resolve(CWD, config.compiler_dist)
const inRoot = (p) => path.resolve(CWD, p)
const inSrc = (p) => path.resolve(ABSOLUTE_SRC_PATH, p)
const inDist = (p) => path.resolve(ABSOLUTE_DIST_PATH, p)

// Webpack constants (derived from user configuration)
const WEBPACK_PUBLIC_PATH = `${config.server_protocol}://${config.server_host}:${config.server_port}/`

// ======================================================
// Create Webpack Configuration
// ======================================================
const webpackConfig = {
  name: 'client',
  target: 'web',
  devtool: config.compiler_devtool,
  resolve: {
    root: ABSOLUTE_SRC_PATH,
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
const APP_MAIN = inSrc('main.js')
const APP_ENTRIES = [inSrc('main.js')]
if (__DEV__) {
  APP_ENTRIES.push(`webpack-hot-middleware/client?path=${WEBPACK_PUBLIC_PATH}__webpack_hmr`)
}
webpackConfig.entry = { app: APP_ENTRIES }

// Automatically include the babel polyfill in the vendor bundle
webpackConfig.entry.vendor = [inRoot('node_modules/babel-polyfill/lib/index.js')]
  .concat(config.compiler_vendors || [])

// ----------------------------------
// Compiler Target (Dist)
// ----------------------------------
const hashType = __DEV__ ? 'hash' : 'chunkhask'
webpackConfig.output = {
  filename: `[name].[${hashType}].js`,
  path: ABSOLUTE_DIST_PATH,
  publicPath: WEBPACK_PUBLIC_PATH,
  pathinfo: true,
}

// ======================================================
// Pre Loaders
// ======================================================
if (config.compiler_lint) {
  webpackConfig.module.preLoaders = [{
    test: /\.(js|jsx)$/,
    loader: 'eslint',
    exclude: /node_modules/,
  }]

  webpackConfig.eslint = {
    configFile: inRoot('.eslintrc'),
    emitWarning: __DEV__,
  }
}

// ======================================================
// Loaders
// ======================================================
// ----------------------------------
// JavaScript
// ----------------------------------
webpackConfig.module.loaders.push({
  test: /\.js$/,
  exclude: /node_modules\/(?!(stardust))/,
  loader: 'babel',
  query: {
    cacheDirectory: true,
    plugins: [
      'add-module-exports',
      'transform-runtime',
      'transform-decorators-legacy',
    ],
    presets: ['es2015', 'react', 'stage-1'],
    env: {
      development: {
        plugins: [
          ['react-transform', {
            transforms: [{
              transform: 'react-transform-hmr',
              imports: ['react'],
              locals: ['module'],
            }, {
              transform: 'react-transform-catch-errors',
              imports: ['react', 'redbox-react'],
            }],
          }],
        ],
      },
    },
  },
})

// ----------------------------------
// JSON
// ----------------------------------
webpackConfig.module.loaders.push({
  test: /\.json$/,
  loader: 'json'
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
  includePaths: inSrc('styles'),
}
webpackConfig.postcss = [
  cssnano({
    autoprefixer: config.compiler_autoprefix,
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
console.log('globals =', config.compiler_globals)
webpackConfig.plugins.push(
  new webpack.DefinePlugin(config.compiler_globals),
  new HtmlWebpackPlugin({
    template: inSrc('index.html'),
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
} else if (__PROD__) {
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
