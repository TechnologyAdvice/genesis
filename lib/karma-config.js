const { config } = require('./context').get()
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
    preprocessors: {
      [config.test_entry]: ['webpack'],
    },
    reporters: ['mocha', 'coverage'],
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
