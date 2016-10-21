const chalk = require('chalk')
const debug = require('debug')('genesis:validators')
const leven = require('leven')
const _ = require('lodash/fp')
const log = require('./log')
const semver = require('semver')
const { pathExists } = require('./utils')

const reportIssues = (title, issues) => {
  if (!_.isEmpty(issues)) {
    debug(`Reporting ${issues.length} issues`)
    log.error(`${title}:`, ...issues.map(issue => `\n - ${issue}`))
    process.exit(1)
  } else {
    debug('No issues to report')
  }
}

exports.currentNodeVersion = () => {
  debug('Validating node version')
  const pkg = require('../package')
  const issues = []

  if (!semver.satisfies(process.version, pkg.engines.node)) {
    issues.push(`${pkg.name} requires node ${pkg.engines.node}, the current version is ${process.version}.`)
  }

  reportIssues('Node version', issues)
}

exports.validateConfig = function validateConfig(projectConfig) {
  debug('Validating config')
  const defaultConfig = require('./default-config')
  const defaultConfigKeys = _.keys(defaultConfig)

  const issues = []

  // Config is object
  if (projectConfig && !_.isPlainObject(projectConfig)) {
    issues.push(`Config must be a plain object, received: ${{}.toString.call(projectConfig)}`)
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

      issues.push(`${unknownKey}\n   ${chalk.gray('Did you mean?:')} ${bestMatches}`)
    })
  )(projectConfig)

  reportIssues('Config', issues)

  return projectConfig
}

exports.validateProject = function validateProject() {
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
    const message = `Missing ${path}`
    debug(message)
    issues.push(message)
  })

  const disallowed = [
    'test/main.test.js',
    'test/setup.js',
  ]
  disallowed.forEach(path => {
    if (!pathExists(path)) return

    const message = `Remove ${path}`
    debug(message)
    issues.push(message)
  })

  reportIssues('Project structure', issues)
}
