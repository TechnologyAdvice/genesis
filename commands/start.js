module.exports = {
  command: 'start',
  describe: 'start the live development server',

  builder(yargs) {
    return yargs
      .group(['h', 'p'], 'Server:')
      .option('p', {
        alias: 'port',
      })
      .option('h', {
        alias: 'host',
      })
      .option('v', {
        alias: 'verbose',
        default: false,
        describe: 'output more information',
      })
  },

  execute(config, argv) {
    const chalk = require('chalk')
    const log = require('../utils/log')

    log('Starting the live development server...')
    return require('genesis-core').dev(config)
      .then((app) => {
        const location = `${config.server_protocol}://${config.server_host}:${config.server_port}`
        log.success(`The server is running at ${chalk.green(location)}`)
      })
  },
}
