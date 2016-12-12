const chalk = require('chalk')
const debug = require('debug')('genesis:validators')
const leven = require('leven')
const _ = require('lodash/fp')
const log = require('./log')
const semver = require('semver')
const { pathExists } = require('./utils')

/**
 * Log a batch of messages.
 * @param {object[]} issues An array of { message: <string>, logLevel: <string> } objects to report.
 *   Each issue.logLevel is either `log`, `info`, `warn`, or `error`.
 * @returns {undefined}
 */
const report = (issues) => {
  if (_.isEmpty(issues)) {
    debug('No messages to report')
    return
  }

  debug(`Reporting ${issues.length} messages`)

  let warnCount = 0
  let errorCount = 0

  // clear any spinners
  log.spinStopAndClear()

  issues.forEach(msg => {
    log[msg.logLevel](msg.message)
    if (msg.logLevel === 'warn') warnCount++
    if (msg.logLevel === 'error') errorCount++
  })

  if (warnCount || errorCount) {
    process.stderr.write('\n')
    if (errorCount) process.stderr.write(chalk.red(`  Errors: ${errorCount}`))
    if (warnCount) process.stderr.write(chalk.yellow(`  Warnings: ${warnCount}`))
    process.stderr.write('\n\n')
  }

  if (_.some(['logLevel', 'error'], issues)) {
    throw new Error('Fix validation errors above and try again.')
  }
}

exports.currentNodeVersion = function currentNodeVersion() {
  debug('Validating node version')
  const pkg = require('../package')
  const messages = []

  if (!semver.satisfies(process.version, pkg.engines.node)) {
    messages.push({
      message: `Node ${chalk.green(pkg.engines.node)} is required, current version is ${chalk.red(process.version)}.`,
      logLevel: 'error',
    })
  }

  report(messages)
}

exports.projectConfig = function projectConfig(config) {
  debug('Validating project config')
  const defaultConfig = require('./default-config')
  const defaultConfigKeys = _.keys(defaultConfig)

  const issues = []

  // Config is object
  if (config && !_.isPlainObject(config)) {
    issues.push({
      message: `Config must be a plain object, received: ${{}.toString.call(config)}`,
      logLevel: 'error',
    })
  }

  // Ensure all keys are valid keys, providing help:
  //   Unknown config: complierAlas
  //   Did you mean?: compiler_alias
  _.flow(
    _.keys,
    _.without(defaultConfigKeys),
    _.each(unknownKey => {
      const bestMatches = _.flow(
        _.map(name => ({ name, score: leven(unknownKey, name) })),
        _.sortBy(['score', 'name']),
        _.take(2),
        _.map('name'),
        _.join(', ')
      )(defaultConfigKeys)

      issues.push({
        message: `${unknownKey}\n   ${chalk.gray('Did you mean?:')} ${bestMatches}`,
        logLevel: 'error',
      })
    })
  )(config)

  report(issues)
}

exports.projectStructure = function projectStructure() {
  debug('Validating project')
  const issues = []

  const required = [
    // root
    '.editorconfig',
    '.eslintignore',
    '.eslintrc',
    '.gitignore',
    'package.json',
    'README.md',

    // src
    'src/index.html',
    // TODO: this should be part of the webpack validation, ensure entry and vendors exist
    'src/main.js',

    // src/assets
    'src/assets/apple-touch-icon.png',
    'src/assets/favicon.png',
    'src/assets/robots.txt',

    // src/styles
    'src/styles/main.scss',

    // test
    'test/.eslintrc',
    'test/specs',
  ]
  required.forEach(path => {
    if (pathExists(path)) return
    const message = `Missing required ${path}`
    debug(message)
    issues.push({ message, logLevel: 'error' })
  })

  const deprecated = [
    'test/main.test.js',
    'test/setup.js',
  ]

  deprecated.forEach(path => {
    if (!pathExists(path)) return
    const message = `Remove deprecated ${path}`
    debug(message)
    issues.push({ message, logLevel: 'warn' })
  })

  report(issues)
}

exports.webpackConfig = (webpackConfig) => {
  const webpackValidator = require('webpack-validator')
  const Joi = require('webpack-validator').Joi

  const schemaExtension = Joi.object({
    module: {
      wrappedContextCritical: Joi.boolean(),
      wrappedContextRecursive: Joi.boolean(),
      wrappedContextRegExp: Joi.object(),
      exprContextCritical: Joi.boolean(),
      exprContextRecursive: Joi.boolean(),
      exprContextRegExp: Joi.object(),
      exprContextRequest: Joi.string(),
      unknownContextCritical: Joi.boolean(),
      unknownContextRegExp: Joi.object(),
      unknownContextRecursive: Joi.boolean(),
      unknownContextRequest: Joi.string(),
    },
    output: {
      hashDigest: Joi.string(),
      hashFunction: Joi.string(),
    },
    optimize: Joi.object(),
    resolve: {
      fastUnsafe: Joi.array(),
    },
    resolveLoader: {
      fastUnsafe: Joi.array(),
    },
    sassLoader: Joi.object(),
  })

  const results = webpackValidator(webpackConfig, {
    schemaExtension,
    returnValidation: true,
    rules: {
      'no-root-files-node-modules-nameclash': true,
      'loader-enforce-include-or-exclude': false,
      'loader-prefer-include': false,
    },
  })

  const issues = _.map(({ path, message }) => ({
    logLevel: 'error',
    message: `webpackConfig.${path} = ${JSON.stringify(_.get(path, webpackConfig), null, 2)}, ${message}.`,
  }))(results.error && results.error.details)

  report(issues)
}
