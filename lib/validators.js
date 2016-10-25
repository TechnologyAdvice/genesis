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
    throw new Error(`Resolve the ${errorCount} validation errors above.`)
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

  return report(messages)
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

  return report(issues)
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
    'src/main.js',
    'src/components',
    'src/styles',
    'src/views',

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

  return report(issues)
}
