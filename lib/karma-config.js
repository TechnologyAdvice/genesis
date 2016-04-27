'use strict';

const path = require('path'),
      debug = require('debug')('ta:karma:config'),
      config = require('./config'),
      babelConfig = require('./internal/_babel-config').__do_not_change_or_you_will_be_fired__,
      webpackConfig = require('./webpack-config')

const webpackResolve = Object.assign({}, webpackConfig.resolve)
webpackResolve.alias = Object.assign({}, webpackResolve.alias, {
  sinon: 'sinon/pkg/sinon.js',
})

const karmaConfig = {
  basePath: process.cwd(),
  files: [
    './node_modules/babel-polyfill/dist/polyfill.js',
    {
      pattern: config.test_entry,
      watched: false,
      served: true,
      included: true,
    }
  ],
  singleRun: !config.test_watch,
  frameworks: ['mocha'],
  preprocessors: {
    [config.test_entry]: ['webpack'],
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
    isparta: {
      babel: {
        plugins: babelConfig.plugins,
        presets: babelConfig.presets,
      },
    },
  },
  webpackMiddleware: {
    stats: config.compiler_stats,
    noInfo: true,
  },
  coverageReporter: {
    reporters: config.test_coverage_reporters,
  },
}

if (!config.test_watch) {
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
