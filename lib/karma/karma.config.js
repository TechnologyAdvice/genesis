const path = require('path'),
      debug = require('debug')('ta:karma:config'),
      config = require('../config')
      makeWebpackConfig = require('../webpack/make-webpack-config')

const ENTRY_BUNDLE = './test/test-bundler.js'
const webpackConfig = makeWebpackConfig(config)

const webpackResolve = Object.assign({}, webpackConfig.resolve)
webpackResolve.alias = Object.assign({}, webpackResolve.alias, {
  sinon: 'sinon/pkg/sinon.js',
})

const karmaConfig = {
  basePath: process.cwd(),
  files: [
    './node_modules/babel-polyfill/dist/polyfill.js',
    {
      pattern: ENTRY_BUNDLE,
      watched: false,
      served: true,
      included: true,
    }
  ],
  singleRun: !config.test_watch,
  frameworks: ['mocha'],
  preprocessors: {
    [ENTRY_BUNDLE]: ['webpack'],
  },
  reporters: ['mocha'],
  browsers: ['PhantomJS'],
  webpack: {
    devtool: 'cheap-module-source-map',
    resolve: webpackResolve,
    plugins: webpackConfig.plugins,
    module: {
      noParse: (webpackConfig.module.noParse || []).concat([
        /\/sinon\.js/,
      ]),
      loaders: webpackConfig.module.loaders.concat([
        {
          test: /sinon\/pkg\/sinon\.js/,
          loader: 'imports?define=>false,require=>false',
        },
      ]),
    },
    externals: {
      'react/lib/ReactContext': true,
      'react/lib/ExecutionEnvironment': true,
    },
    sassLoader: webpackConfig.sassLoader,
    postcss: webpackConfig.postcss,
  },
  webpackMiddleware: {
    stats: config.compiler_stats,
    noInfo: true,
  },
  coverageReporter: {
    reporters: [],
  },
}

if (config.compiler_globals.__REPORT_TEST_COVERAGE__) {
  karmaConfig.reporters.push('coverage')
  karmaConfig.webpack.module.preLoaders = [{
    test: /\.js$/,
    include: path.resolve(process.cwd(), config.compiler_src),
    loader: 'isparta',
    exclude: /node_modules/,
  }]
}

module.exports = function makeKarmaConfig(cfg) {
  cfg.set(karmaConfig)
}
