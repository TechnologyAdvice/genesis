#!/usr/bin/env node
'use strict';

const debug = require('debug')('ta:bin:compile'),
      config = require('../lib/config'),
      webpack = require('webpack'),
      webpackConfig = require('../lib/webpack-config')

debug('Create webpack compiler.')
const compiler = webpack(webpackConfig)

debug('Run webpack compiler.')
compiler.run((err, stats) => {
  const jsonStats = stats.toJson()
  const errors = jsonStats.errors
  const warnings = jsonStats.warnings

  debug('Webpack compile completed.')
  console.log(stats.toString(config.compiler_stats))

  if (err) {
    debug('Webpack compiler encountered a fatal error.')
    console.log(err)
    process.exit(1)
  } else if (errors.length > 0) {
    debug('Webpack compiler encountered errors.')
    console.log(errors)
    process.exit(1)
  } else if (warnings.length > 0) {
    debug('Webpack compiler encountered warnings.')

    if (config.compiler_fail_on_warning) {
      process.exit(1)
    }
  }
})
