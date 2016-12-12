const karma = require('karma')
const log = require('../lib/log')

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

    if (karmaConfig.logLevel && karmaConfig.logLevel === 'DEBUG') {
      /* eslint-disable no-console */
      server.on('listening', () => log.info('test karma.Server: listening'))
      server.on('browser_register', () => log.info('test karma.Server: browser_register'))
      server.on('browser_error', () => log.info('test karma.Server: browser_error'))
      server.on('browser_start', () => log.info('test karma.Server: browser_start'))
      server.on('browser_complete', () => log.info('test karma.Server: browser_complete'))
      server.on('browser_change', () => log.info('test karma.Server: browser_change'))
      server.on('run_start', () => log.info('test karma.Server: run_start'))
      server.on('run_complete', () => log.info('test karma.Server: run_complete'))
      /* eslint-enable no-console */
    }

    server.start()
  })
}
