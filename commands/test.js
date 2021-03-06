const debug = require('debug')('genesis:commands:test')

module.exports = {
  command: 'test',
  describe: 'run tests',

  builder(yargs) {
    return yargs
      .option('watch', {
        alias: 'w',
        default: false,
        type: 'boolean',
      })
      .option('debug', {
        alias: 'd',
        default: false,
        type: 'boolean',
      })
  },

  execute(argv) {
    const test = require('../bin/test')
    const validators = require('../lib/validators')

    return Promise.resolve()
      .then(validators.projectStructure)
      .then(res => {
        // ----------------------------------------
        // Project config
        // ----------------------------------------
        debug('Gathering project config')
        const getConfig = require('../lib/get-config')
        const config = getConfig(argv.config, {
          compiler_env: argv.env || 'test',
        })

        // ----------------------------------------
        // Webpack config
        // ----------------------------------------
        debug('Gathering webpack config')
        const getWebpackConfig = require('../lib/get-webpack-config')
        const webpackConfig = getWebpackConfig(config, {
          coverage: true,
          hmr: false,
          minify: false,
          mocks: true,
          splitBundle: false,
        })

        // add sinon alias
        webpackConfig.resolve = Object.assign({}, webpackConfig.resolve, {
          alias: Object.assign({}, webpackConfig.resolve.alias, {
            sinon: 'sinon/pkg/sinon.js',
          }),
        })

        // ----------------------------------------
        // Karma config
        // ----------------------------------------
        debug('Gathering karma config')
        const { watch } = argv
        const getKarmaConfig = require('../lib/get-karma-config.js')
        const karmaConfig = Object.assign({}, getKarmaConfig(config, webpackConfig), {
          autoWatch: watch,
          singleRun: !watch,
        })

        if (argv.debug) {
          karmaConfig.logLevel = 'DEBUG'
        }

        // ----------------------------------------
        // Run
        // ----------------------------------------
        debug('Running test')
        return test(karmaConfig)
          .then(() => {
            // we need to exit on success or Karma stays open for some time
            process.exit(0)
          })
      })
  },
}
