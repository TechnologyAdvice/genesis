const chalk = require('chalk')
const childProcess = require('child_process')
const fs = require('fs-promise')
const debug = require('debug')('genesis:utils')
const log = require('./log')

// ============================================================
// Handle Errors
// ============================================================
exports.handleError = (err) => {
  debug('Handling error')

  // add whitespace to draw more attention to the message
  if (err) process.stderr.write('\n')

  // Log formatted error strings
  if (typeof err === 'string') log.error(chalk.red(err))

  // Log Error formatted object messages with less pronounced stack
  if (err instanceof Error) {
    log.error(chalk.red(err.message))
    process.stderr.write(chalk.gray(err.stack))
  }

  process.exit(1)
}

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
    const { verbose } = options
    const [command, ...args] = commandString.split(' ')
    const prettyCommand = `${command} ${args.join(' ')}`
    debug(`Spawn promise: \`${prettyCommand}\``)

    const child = childProcess.spawn(command, args, { stdio: verbose && 'inherit' })

    let stdout = ''
    let stderr = ''

    // Streams are null when `verbose` and stdio is `inherit`.
    // Ensure they exists before calling `on()`.
    if (child.stdout) child.stdout.on('data', data => (stdout += data))
    if (child.stderr) child.stderr.on('data', data => (stderr += data))

    child.on('exit', (exitCode) => {
      debug(`${prettyCommand} exited with code ${exitCode}`)
      const message = { command: commandString, exitCode, stdout, stderr }

      if (exitCode === 0) {
        resolve(message)
      } else {
        reject(message)
      }
    })
  })
}
