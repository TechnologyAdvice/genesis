const debug = require('debug')('genesis:command:start')
const { log } = require('../lib/utils')

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
