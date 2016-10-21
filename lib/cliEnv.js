const debug = require('debug')('genesis:cliEnv')

// The `env` from the cli invocation, see cli.js
// This mutable object is accessed via the get() / set() methods below
let cliEnv = {}

module.exports = {
  get() {
    debug('Getting cliEnv')
    return Object.assign({}, cliEnv)
  },
  set(newEnv) {
    debug('Setting cliEnv')

    cliEnv = Object.assign({}, newEnv)
  },
}
