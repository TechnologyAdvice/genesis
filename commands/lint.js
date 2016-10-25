module.exports = {
  command: 'lint',
  describe: 'lint the project',

  builder(yargs) {
    return yargs
      .option('fix', {
        alias: 'f',
        default: false,
        type: 'boolean',
      })
  },

  execute(argv) {
    const validators = require('../lib/validators')
    const { spawnPromise } = require('../lib/utils')
    const log = require('../lib/log')

    return Promise.resolve()
      .then(validators.projectStructure)
      .then(() => {
        let command = 'node_modules/.bin/eslint . --color'
        if (argv.fix) command += ' --fix'

        log.spin('Linting')
        return spawnPromise(command, { verbose: false })
      })
      .then(res => {
        log.spinSucceed()
      })
      .catch(({ stdout, stderr }) => {
        log.spinFail()
        process.stderr.write(stdout)
        process.stderr.write(stderr)
        return Promise.reject()
      })
  },
}
