#!/usr/bin/env node
const webpack = require('webpack')

/**
 * Compile a webpackConfig with additional genesisConfig.
 * Rejects with webpack errors, resolves with webpack stats.
 * @param {object} webpackConfig - Any webpack configuration
 * @return {Promise}
 */
module.exports = function build(webpackConfig) {
  // TODO Basic webpack config validation
  // https://www.npmjs.com/package/webpack-validator

  return new Promise((resolve, reject) => {
    const compiler = webpack(webpackConfig)

    compiler.run((err, stats) => {
      if (err || stats.hasErrors() || stats.hasWarnings()) {
        reject({ err, stats })
      } else {
        resolve(stats)
      }
    })
  })
}
