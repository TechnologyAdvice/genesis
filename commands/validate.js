const debug = require('debug')('genesis:command:validate')
const validators = require('../lib/validators')
const log = require('../lib/log')

module.exports = {
  command: 'validate',
  describe: 'Validate the project structure',

  handler(argv) {
    debug('Executing')
    validators.validateProject()
    log.success('Project is valid')
  },
}
