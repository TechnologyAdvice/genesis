const debug = require('debug')('genesis:config:karma')
const paths = require('./paths')

/**
 * Returns a Karma config.
 * @param {object} config - A valid Genesis config object
 * @param {object} webpackConfig - High level configuration options.
 * @returns {object} A valid Karma configuration.
 */
module.exports = function getKarmaConfig(config, webpackConfig) {
  debug('Getting Karma config from config and webpackConfig:', config, webpackConfig)
  const karmaConfig = {
    basePath: paths.cwdRoot(),
    browsers: ['PhantomJS'],
    coverageReporter: {
      reporters: [
        { type: 'text-summary' },
        { type: 'lcov', dir: 'coverage' },
      ],
    },
    client: {
      mocha: {
        reporter: 'html',   // change Karma's debug.html to mocha web reporter
        ui: 'bdd',
      },
    },
    files: [
      config.test_entry,
    ],
    formatError(msg) {
      let haveSeenStack = false
      return msg
        .split('\n')
        .reduce((list, line) => {
          // filter out node_modules
          if (/~/.test(line)) return list

          // indent the error beneath the it() message
          let newLine = '  ' + line

          if (newLine.includes('webpack:///')) {
            if (haveSeenStack === false) {
              const indent = newLine.slice(0, newLine.search(/\S/))
              newLine = `\n${indent}Stack:\n${newLine}`
              haveSeenStack = true
            }

            // remove webpack:///
            newLine = newLine.replace('webpack:///', '')

            // remove bundle location, showing only the source location
            newLine = newLine.slice(0, newLine.indexOf(' <- '))
          }

          return list.concat(newLine)
        }, [])
        .join('\n')
    },
    frameworks: ['mocha'],
    logLevel: 'WARN',
    preprocessors: {
      [config.test_entry]: ['webpack'],
    },
    reporters: ['mocha', 'coverage'],
    singleRun: true,
    webpack: {
      devtool: webpackConfig.devtool,
      resolve: webpackConfig.resolve,
      plugins: webpackConfig.plugins,
      module: {
        noParse: [].concat(webpackConfig.module.noParse, [
          /\/sinon\.js/,
        ]),
        loaders: [].concat(webpackConfig.module.loaders, [
          {
            test: /sinon\/pkg\/sinon\.js/,
            loader: 'imports?define=>false,require=>false',
          },
        ]),
      },
      externals: {
        'react/addons': true, // enzyme compatibility
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
  }

  debug('Final Karma config', karmaConfig)
  return karmaConfig
}
