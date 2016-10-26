#!/usr/bin/env node
const webpack = require('webpack')

/**
 * Compile a webpackConfig with additional genesisConfig.
 * Rejects with webpack errors, resolves with webpack stats.
 * @param {object} webpackConfig - Any webpack configuration
 * @return {Promise}
 */
module.exports = function build(webpackConfig) {
  return new Promise((resolve, reject) => {
    const compiler = webpack(webpackConfig)

    const validators = require('../lib/validators')
    validators.webpackConfig(webpackConfig)

    compiler.run((err, stats) => {
      if (err) throw err
      resolve(stats)
    })
  })
}
