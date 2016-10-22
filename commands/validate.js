module.exports = {
  command: 'validate',
  describe: 'validate the project structure',

  execute(argv) {
    const log = require('../lib/log')
    const validators = require('../lib/validators')

    return Promise.resolve()
      .then(validators.projectStructure)
      .then(() => log.success('Project is valid'))
  },
}
