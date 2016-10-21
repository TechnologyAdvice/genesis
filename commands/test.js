const debug = require('debug')('genesis:command:test')
const path = require('path')

const test = require('../bin/test')
const log = require('../lib/log')
const validators = require('../lib/validators')

module.exports = {
  command: 'test',
  describe: 'Run tests',

  builder(yargs) {
    return yargs
      .option('watch', {
        alias: 'w',
        default: false,
        type: 'boolean',
      })
  },

  handler(argv) {
    debug('Executing')
    if (!process.env.NODE_ENV) {
      log.info('Setting default NODE_ENV=test')
      process.env.NODE_ENV = 'test'
    }

    if (!process.env.APP_ENV) {
      log.info('Setting default APP_ENV=test')
      process.env.APP_ENV = 'test'
    }

    const { watch } = argv
    validators.validateProject()

    test({
      singleRun: !watch,
      configFile: path.resolve(__dirname, '../lib/karma-config.js'),
    })
      .then(res => {
        log.success(res.message)
        process.exit(res.exitCode)
      })
      .catch(res => {
        log.error(res.message)
        process.exit(res.exitCode)
      })
  },
}
