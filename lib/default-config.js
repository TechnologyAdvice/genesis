const debug = require('debug')('genesis:default-config')
const configSchema = require('./config-schema')
const _ = require('lodash/fp')

const defaultConfig = _.mapValues('default', configSchema)

debug(`Generated default config = ${JSON.stringify(defaultConfig, null, 2)}`)
module.exports = defaultConfig
