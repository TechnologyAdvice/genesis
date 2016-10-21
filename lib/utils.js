const childProcess = require('child_process')
const fs = require('fs-promise')
const debug = require('debug')('genesis:utils')

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
