const chalk = require('chalk')
const childProcess = require('child_process')
const circularJSON = require('circular-json')
const figures = require('figures')
const fs = require('fs-promise')
const debug = require('debug')('genesis:utils')

// ============================================================
// Logger
// ============================================================
const print = (stream, color, symbol, ...msgs) => {
  const formattedMessages = msgs
    .map(msg => {
      // pretty print objects with circular support
      return {}.toString.call(msg) === '[object Object]'
        ? circularJSON.stringify(msg, null, 2)
        : msg
    })

  console[stream](color(`${symbol} Genesis`), ...formattedMessages) // eslint-disable-line no-console
}

exports.log = (...msgs) => print('log', chalk.white.dim, '-', ...msgs)
exports.log.error = (...msgs) => print('error', chalk.red, figures.cross, ...msgs)
exports.log.warning = (...msgs) => print('error', chalk.yellow, figures.warning, ...msgs)
exports.log.info = (...msgs) => print('log', chalk.cyan, figures.info, ...msgs)
exports.log.success = (...msgs) => print('log', chalk.green, figures.tick, ...msgs)

// ============================================================
// Path Exists
// ============================================================
exports.pathExists = function pathExists(path) {
  debug(`Checking if path exists ${path}`)
  try {
    fs.accessSync(path)
    return true
  } catch (e) {
    return false
  }
}

// ============================================================
// Promisified Spawn
// ============================================================
exports.spawnPromise = function spawnPromise(commandString, options = { verbose: false }) {
  return new Promise((resolve, reject) => {
    const [command, ...args] = commandString.split(' ')
    debug(`Spawning child process promise: ${command} args: ${args}`)

    childProcess.spawn(command, args, { stdio: options.verbose && 'inherit' })
      .on('exit', (exitCode) => {
        const message = { command: commandString, exitCode }

        if (exitCode === 0) {
          resolve(message)
        } else {
          reject(message)
        }
      })
  })
}
