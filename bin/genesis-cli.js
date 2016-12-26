#!/usr/bin/env node
const chalk = require('chalk')
const debug = require('debug')('genesis:cli')
const { extensions } = require('interpret')
const Liftoff = require('liftoff')
const v8flags = require('v8flags')
const yargs = require('yargs')
const _ = require('lodash/fp')
const path = require('path')
const log = require('../utils/log')

const handleFatalError = (err) => {
  debug('Encountered a fatal error')

  // add whitespace to draw more attention to the message
  if (err) process.stderr.write('\n')

  // Log formatted error strings
  if (typeof err === 'string') {
    log.error(chalk.red(err))
  } else if (err instanceof Error) {
    // Log Error formatted object messages with less pronounced stack
    log.error(chalk.red(err.message))
    process.stderr.write(chalk.gray(err.stack))
  }

  process.exit(1)
}

// ==================================================
// Parse Args
// ==================================================
debug('Parsing args')
let argv = yargs
  .commandDir(path.resolve(__dirname, '../commands'))
  .completion()
  .demand(1, 'You must specify a command')
  .fail((msg, err) => handleFatalError(err || msg))
  .help()
  .option('c', {
    describe: 'Config file path',
    global: true,
    type: 'string',
    alias: 'config',
  })
  .wrap(yargs.terminalWidth())
  .option('env', {
    describe: 'Set app environment globals',
    global: true,
    type: 'string',
    choices: [
      'development',
      'production',
      'staging',
      'test',
    ],
  })
  .option('cwd', {
    describe: 'Change the current working directory',
    default: '.',
    global: true,
  })
  .option('v', {
    describe: 'Show version number',
    alias: 'version',
    global: false,
    type: 'boolean',
  })
  .recommendCommands()
  .strict()
  .usage('\nUsage: $0 <command> [options]')
  .argv

// ==================================================
// Early exits
// ==================================================
// version
if (argv.version) {
  console.log(require('../package').version) // eslint-disable-line no-console
  process.exit(0)
}

// ==================================================
// Initialize CLI
// ==================================================
debug('Initializing Liftoff')
const cli = new Liftoff({
  processTitle: 'genesis',
  moduleName: 'genesis',
  configName: 'genesis.config',
  extensions: Object.assign({}, extensions, {
    rc: null,
  }),
  v8flags,
  configFiles: {
    '.genesis': {
      home: { path: '~' },
      up: { path: '.', findUp: true },
    },
    genesis: {
      home: { path: '~' },
      up: { path: '.', findUp: true },
    },
    'genesis.config': {
      home: { path: '~' },
      up: { path: '.', findUp: true },
    },
  },
})

// ==================================================
// Add CLI Events
// ==================================================
debug('Adding Liftoff events')
cli
  .on('require', (name, module) => {
    // Emitted when a module is pre-loaded
    log('Requiring external module: ' + name + '...')

    // automatically register coffee-script extensions
    if (name === 'coffee-script') {
      module.register()
    }
  })

  .on('requireFail', (name, err) => {
    // Emitted when a requested module cannot be preloaded
    log.error(`Failed to require: \`${name}\``, err)
  })

  .on('respawn', (flags, child) => {
    // Emitted when Liftoff re-spawns your process (when a v8flags is detected)
    log('Detected node flags:', flags)
    log('Respawned to PID:', child.pid)
  })

// ==================================================
// Launch CLI
// ==================================================
// About `invoke`:
// liftoff settings             - this
// cli options                  - argv
// cwd                          - env.cwd
// local modules preloaded      - env.require
// searching for                - env.configNameRegex
// found config at              - env.configPath
// config base dir              - env.configBase
// your local module is located - env.modulePath
// local package.json           - env.modulePackage
// cli package.json             - require('./package')
const invoke = (env) => Promise.resolve()
  .then(() => {
    // ----------------------------------------
    // Updates
    // ----------------------------------------
    const updateNotifier = require('update-notifier')
    const pkg = require('../package.json')
    updateNotifier({ pkg }).notify()

    // ----------------------------------------
    // Pre Validations
    // ----------------------------------------
    // const validators = require('./lib/validators')
    // validators.currentNodeVersion()

    // ----------------------------------------
    // Current Working Directory
    // ----------------------------------------
    if (process.cwd() !== env.cwd) {
      process.chdir(env.cwd)
      log.info('Working directory changed to:', chalk.blue(env.cwd))
    }

    // ----------------------------------------
    // Load config
    // ----------------------------------------
    // Find all the config file path strings in env.configFiles
    //
    //   configFiles = {
    //     '.genesis'      : { home: '/Users/bob/.genesisrc', up: null },
    //     genesis         : { home: null, up: null },
    //     'genesis.config': { home: null, up: /Users/bob/projects/chat/genesis.js },
    //   }
    //
    // => [ '/Users/bob/.genesisrc', '/Users/bob/projects/chat/genesis.js' ]
    let configFilePath
    if (env.configPath) {
      configFilePath = env.configPath
    } else {
      const availableConfigFiles = _.flow(
        _.values,
        _.flatMap(_.values),
        _.filter(_.isString),
        _.uniq
      )(env.configFiles)
      if (availableConfigFiles.length) {
        debug('Found configuration files:', availableConfigFiles)
        configFilePath = availableConfigFiles[0]
      } else {
        debug('No configuration files found.')
      }
    }

    let config
    if (configFilePath) {
      debug(`Loading configuration file: ${configFilePath}.`)
      config = require(configFilePath)
    }
    argv = yargs.parse(process.argv.slice(2))

    // ----------------------------------------
    // Execute Command
    // ----------------------------------------
    const commandName = argv._

    debug(`Executing command: ${commandName}.`)
    if (!argv.verbose) log.info('Run with --verbose to see more output')
    return require(`../commands/${commandName}`).execute(config, argv)
  })
  .catch(handleFatalError)

debug('Launching CLI')
cli.launch({
  cwd: argv.cwd,
  configPath: argv.config,
}, invoke)
