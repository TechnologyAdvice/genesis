const karma = require('karma')

module.exports = function test(options) {
  return new Promise((resolve, reject) => {
    if (!options.configFile) {
      reject('You must define a configFile option.')
      return
    }

    const server = new karma.Server(options, (exitCode) => {
      const result = {
        exitCode,
        message: `Karma exited with code ${exitCode}`,
      }

      if (exitCode === 0) {
        resolve(result)
      } else {
        reject(result)
      }
    })

    server.start()
  })
}
