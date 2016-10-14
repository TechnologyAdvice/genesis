const debug = require('debug')('genesis:command:test')
const path = require('path')

const test = require('../bin/test')
const { log } = require('../lib/utils')
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
