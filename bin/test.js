const karma = require('karma')

/**
 * Run tests with Karma.
 * @param {object} karmaConfig - A valid Karma config object.
 * @returns {Promise}
 */
module.exports = function test(karmaConfig) {
  return new Promise((resolve, reject) => {
    const server = new karma.Server(karmaConfig, (code) => {
      if (code === 0) resolve(code)
      else reject(code)
    })

    server.start()
  })
}
