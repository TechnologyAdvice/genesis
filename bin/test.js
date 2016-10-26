const karma = require('karma')

/**
 * Run tests with Karma.
 * @param {object} karmaConfig - A valid Karma config object.
 * @returns {Promise}
 */
module.exports = function test(karmaConfig) {
  return new Promise((resolve, reject) => {
    if ({}.toString.call(karmaConfig) !== '[object Object]') {
      throw new Error(`You must pass a karmaConfig object, received \`${typeof karmaConfig}\``)
    }

    const server = new karma.Server(karmaConfig, (code) => {
      if (code === 0) resolve(code)
      else reject(code)
    })

    server.start()
  })
}
