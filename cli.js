#!/usr/bin/env node
const { handleError } = require('./lib/utils')
const debug = require('debug')('genesis:cli')
const { extensions } = require('interpret')
const Liftoff = require('liftoff')
const _ = require('lodash/fp')
const v8flags = require('v8flags')
const yargs = require('yargs')
const log = require('./lib/log')

// ==================================================
// Parse Args
// ==================================================
debug('Parsing args')
const argv = yargs
  .commandDir('commands')
  .completion()
  .demand(1, 'You must specify a command')
  .fail((msg, err) => {
    handleError(err || msg)
  })
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
  console.log(require('./package').version) // eslint-disable-line no-console
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
const invoke = function invoke(env) {
  debug('CLI invoked successfully')
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

  // ----------------------------------------
  // Pre Validations
  // ----------------------------------------
  const validators = require('./lib/validators')

  try {
    validators.currentNodeVersion()
  } catch (err) {
    handleError(err)
  }

  // ----------------------------------------
  // Current Working Directory
  // ----------------------------------------
  if (process.cwd() !== env.cwd) {
    process.chdir(env.cwd)
    log.info('Working directory changed to', env.cwd)
  }

  // ----------------------------------------
  // Find config
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
  const configFilePaths = _.flow(
    _.values,
    _.flatMap(_.values),
    _.filter(_.isString),
    _.uniq
  )(env.configFiles)

  // Add final config to argv.
  // Use configName file or first configFiles path found.
  const config = env.configPath || _.first(configFilePaths)
  yargs.parse(process.argv, { config })
  debug('argv:', JSON.stringify(yargs.argv, null, 2))

  // ----------------------------------------
  // Execute Command
  // ----------------------------------------
  const commandName = argv._
  let commandHandler

  debug(`Loading command: ${commandName}`)
  try {
    commandHandler = require(`./commands/${commandName}`).execute
  } catch (err) {
    handleError(err)
  }

  debug(`Executing command: ${commandName}(${JSON.stringify(argv, null, 2).replace(/\n/g, '\n  ')})`)
  commandHandler(argv).catch(handleError)
}

debug('Launching CLI')
cli.launch({
  cwd: argv.cwd,
  configPath: argv.config,
}, invoke)
