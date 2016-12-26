const childProcess = require('child_process')
const debug = require('debug')('genesis:utils:spawn-promise')

const spawnPromise = (commandString, options) => {
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

module.exports = spawnPromise
