#!/usr/bin/env node
const debug = require('debug')('genesis:cli')
const { extensions } = require('interpret')
const Liftoff = require('liftoff')
const _ = require('lodash/fp')
const v8flags = require('v8flags')
const yargs = require('yargs')

const context = require('./lib/context')
const { log } = require('./lib/utils')

// ==================================================
// Validate Node
// ==================================================
const validators = require('./lib/validators')
validators.currentNodeVersion()

// ==================================================
// Add Commands (without handlers)
// ==================================================
// Do not add the handler or yargs will call it immediately after parsing args.
// We need to first load the config file (see invoke() below) before running the command.
debug('Requiring commands directory')
const commands = require('require-dir')('./commands')

_.each(({ builder, command, describe }) => {
  debug(`Adding command (without handler): ${command}`)
  yargs.command(command, describe, builder)
})(commands)

// ==================================================
// Parse Args
// ==================================================
debug('Parsing args')
const argv = yargs
  .usage('Usage: $0 <command> [options]')
  .command('help <command>', 'Display help')
  .fail((msg, err) => {
    if (err) throw err
    yargs.showHelp()
    log.error(msg)
    process.exit(1)
  })
  .option('config', {
    describe: 'Config file path',
    default: 'genesis.config.js',
    global: true,
  })
  .demand(1, 'You must specify a command')
  .strict()
  .help()
  .version()
  .alias({
    c: 'config',
    h: 'help',
  })
  .recommendCommands()
  .argv

// ==================================================
// Initialize CLI
// ==================================================
debug('Initializing Liftoff')
const cli = new Liftoff({
  processTitle: 'Genesis',
  moduleName: 'Genesis',
  configName: 'genesis.config.js',
  extensions,
  v8flags,
  configFiles: {
    '.genesis': {
      extensions: 'rc',
      up: { path: '.', findUp: true },
    },
    genesis: {
      extensions,
      up: { path: '.', findUp: true },
    },
    'genesis.config': {
      extensions,
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
  debug('CLI was invoked')
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

  if (process.cwd() !== env.cwd) {
    process.chdir(env.cwd)
    log.info('Working directory changed to', env.cwd)
  }

  context.set({ env })

  // Now that the config is loaded, re-add all the commands
  // This time, include the handlers so yargs will execute them
  _.each((command) => {
    debug(`Adding full command: ${command.command}`)
    yargs.command(command)
  })(commands)

  debug('Executing yargs argv, again with full commands')
  yargs.parse(process.argv.slice(2))
}

debug('Launching CLI')
cli.launch({
  cwd: argv.cwd,
  configPath: argv.config,
}, invoke)
