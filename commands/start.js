const debug = require('debug')('genesis:command:start')
const log = require('../lib/log')

module.exports = {
  command: 'start',
  describe: 'Start the dev server',

  builder(yargs) {
    return yargs
      .option('verbose', {
        default: false,
        describe: 'Output more information',
      })
      .alias({
        v: 'verbose',
      })
  },

  handler(argv) {
    debug('Executing')
    if (!process.env.NODE_ENV) {
      log.info('Setting default NODE_ENV=development')
      process.env.NODE_ENV = 'development'
    }

    if (!process.env.APP_ENV) {
      log.info('Setting default APP_ENV=development')
      process.env.APP_ENV = 'development'
    }

    const { verbose } = argv
    const devServer = require('../lib/dev-server')
    const validators = require('../lib/validators')

    validators.validateProject()

    if (!verbose) {
      log('Run with --verbose to see more output')
    }

    log('Starting server...')

    devServer.start({ verbose })
      .then(res => {
        log.success(res)
      })
      .catch(err => {
        log.error(err)
      })
  },
}
