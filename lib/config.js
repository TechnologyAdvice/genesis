'use strict';

const fs = require('fs'),
      path = require('path'),
      debug = require('debug')('ta:config')

/*
 * Attempts to read project-specific configuration settings and apply them
 * as overrides to the default configuration. If no configuration options
 * are found for the project, the defaults are used.
 */
const projectConfigPath = path.join(process.cwd(), 'genesis.config.js')
debug(`Check for project configuration settings in ${projectConfigPath}.`)

// Because Node is awesome and doesn't have a great way of checking
// to see whether or not a file simply exists.
let hasProjectConfiguration
try {
  fs.lstatSync(projectConfigPath)
  hasProjectConfiguration = true
} catch (e) {}

let projectConfiguration
if (hasProjectConfiguration) {
  debug('Project configuration found.')

  // TODO: here we could validate the configuration object. For now we
  // just throw if the require threw, but provide a helpful message.
  try {
    projectConfiguration = require(projectConfigPath)
  } catch (e) {
    debug('There was an error while importing the overrides file:')
    throw e
  }
} else {
  debug('No project-specific configuration found; defaults will be used.')
}

module.exports = Object.assign(
  {},
  require('./assets/default-config'),
  projectConfiguration
)
