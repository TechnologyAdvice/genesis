const debug = require('debug')('genesis:command:lint')

const validators = require('../lib/validators')
const { spawnPromise } = require('../lib/utils')
const log = require('../lib/log')

module.exports = {
  command: 'lint',
  describe: 'Lint the project',

  builder(yargs) {
    return yargs
      .option('fix', {
        alias: 'f',
        default: false,
        type: 'boolean',
      })
  },

  handler(argv) {
    debug('Executing')
    if (!process.env.NODE_ENV) {
      log.info('Setting default NODE_ENV=production')
      process.env.NODE_ENV = 'production'
    }

    if (!process.env.APP_ENV) {
      log.info('Setting default APP_ENV=production')
      process.env.APP_ENV = 'production'
    }

    validators.validateProject()

    let command = 'node_modules/.bin/eslint .'

    if (argv.fix) {
      command += ' --fix'
    }

    spawnPromise(command, { verbose: true })
      .then(res => {
        log.success('There were no linter errors')
        process.exit(res.exitCode)
      }, err => {
        process.exit(err.exitCode)
      })
  },
}
