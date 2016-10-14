const debug = require('debug')('genesis:command:lint')

const validators = require('../lib/validators')
const { log, spawnPromise } = require('../lib/utils')

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
