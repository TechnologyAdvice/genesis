const { log } = require('../core/utils')
const getProjectConfig = require('../core/configs/project.config')

module.exports = {
  command: 'start',
  describe: 'starts the development server',

  builder(yargs) {
    const schema = require('../core/configs/schemas/project.schema')

    return yargs
      .default('env', 'development')
      .group(['h', 'p'], 'Server:')
      .option('p', {
        alias: 'port',
        describe: schema.server_port.describe,
        type: schema.server_port.type,
      })
      .option('h', {
        alias: 'host',
        describe: schema.server_host.describe,
        type: schema.server_host.type,
      })
      .option('v', {
        alias: 'verbose',
        default: false,
        describe: 'Output more information',
      })
  },

  execute(argv) {
    if (!argv.verbose) {
      log.info('Run with --verbose to see more output')
    }

    const config = getProjectConfig(argv.config, {
      compiler_env: argv.env,
      server_port: argv.port,
      server_host: argv.host,
    })
    const runner = require(`../modules/${config.target}/commands/start`)
    return runner(config)
  },
}
