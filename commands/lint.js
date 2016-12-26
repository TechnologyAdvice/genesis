module.exports = {
  command: 'lint',
  describe: 'lint the project for code errors',

  builder(yargs) {
    return yargs
      .option('fix', {
        alias: 'f',
        default: false,
        type: 'boolean',
      })
  },

  execute(config, argv) {
    const spawnPromise = require('../utils/spawn-promise')
    const log = require('../utils/log')

    return Promise.resolve()
      .then(() => {
        let command = 'node_modules/.bin/eslint . --color'
        if (argv.fix) command += ' --fix'

        log.spin('Linting')
        return spawnPromise(command, { verbose: false })
      })
      .then(log.spinSucceed)
      .catch(({ stdout, stderr }) => {
        log.spinFail()
        process.stderr.write(stdout)
        process.stderr.write(stderr)
        throw new Error('There was an error while running the [lint] task.')
      })
  },
}
