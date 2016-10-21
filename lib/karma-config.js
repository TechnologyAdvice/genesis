const config = require('./config')
const webpackConfig = require('./webpack-config')

const webpackResolve = Object.assign({}, webpackConfig.resolve)
webpackResolve.alias = Object.assign({}, webpackResolve.alias, {
  sinon: 'sinon/pkg/sinon.js',
})

module.exports = (karmaConfig) => {
  karmaConfig.set({
    basePath: process.cwd(),
    browsers: ['PhantomJS'],
    coverageReporter: {
      type: 'in-memory',
      // Generate coverage data for all coverage preprocessor source files,
      // even if there are no tests covering them.
      includeAllSources: true,
      reporters: [
        { type: 'text-summary' },
        { type: 'lcov', dir: 'coverage' },
      ],
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
    logLevel: karmaConfig.LOG_WARN,
    preprocessors: {
      [config.test_entry]: ['webpack'],
    },
    reporters: ['mocha', 'coverage'],
    // When watching, Karma delays new runs until the current run is finished.
    // Cancel the current run and start a new run immediately on file change.
    restartOnFileChange: true,
    singleRun: true,
    webpack: {
      devtool: webpackConfig.devtool,
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
  })
}
