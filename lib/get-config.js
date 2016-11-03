const chalk = require('chalk')
const debug = require('debug')('genesis:get-config')
const _ = require('lodash/fp')
const log = require('./log')
const path = require('path')
const paths = require('./paths')
const validators = require('./validators')

/**
 * Returns a built up a Genesis config object.  Load order:
 *   - genesis defaults
 *   - project config
 *   - overrides
 *   - genesis required
 * @param {object} [configPath=null] - Path to a project configuration file.
 * @param {object} [overrides={}] - Overrides default config and project config. Useful for CLI values.
 * @returns {object} Final configuration.
 */
module.exports = function getConfig(configPath = null, overrides = {}) {
  debug('Get config')
  // ----------------------------------------
  // Default Config
  // ----------------------------------------
  debug('Loading default config')
  const defaultConfig = require('./default-config')

  // ----------------------------------------
  // Project Config
  // ----------------------------------------
  let projectConfig = {}

  if (!configPath) {
    debug('No config specified')
    log.info('Using default config')
  } else {
    debug(`Trying to load config ${configPath}`)

    try {
      projectConfig = require(paths.cwdRoot(configPath))
      debug('Config loaded')
      log.info(`Using config ${chalk.blue(configPath)}`)

      validators.projectConfig(projectConfig)
    } catch (err) {
      debug('Config load failed')
      err.message = `Could not load config. ${err.message}`
      throw err
    }
  }
  debug(`Project config = ${JSON.stringify(projectConfig, null, 2)}`)

  // ----------------------------------------
  // Overrides
  // ----------------------------------------
  debug('Scrubbing override config')
  const overrideConfig = _.omitBy(_.isUndefined, overrides)
  debug(`Override config = ${JSON.stringify(overrideConfig, null, 2)}`)

  // ----------------------------------------
  // Environment
  // ----------------------------------------
  debug('Setting environment globals')
  const __ENV__ = overrides.compiler_env || projectConfig.compiler_env || process.env.NODE_ENV
  const __DEV__ = __ENV__ === 'development'
  const __TEST__ = __ENV__ === 'test'
  const __STAG__ = __ENV__ === 'staging'
  const __PROD__ = __ENV__ === 'production'
  const NODE_ENV = process.env.NODE_ENV || __ENV__

  if (!process.env.NODE_ENV) {
    log.info(`Using default ${chalk.blue(`NODE_ENV=${NODE_ENV}`)}`)
  }
  if (!overrides.compiler_env && !projectConfig.compiler_env && !process.env.NODE_ENV) {
    log.info(`Using default ${chalk.blue(`compiler_env=${__ENV__}`)}`)
  }
  debug(`Environment globals = ${JSON.stringify({
    __ENV__,
    __DEV__,
    __TEST__,
    __STAG__,
    __PROD__,
    NODE_ENV,
  }, null, 2)}`)

  // ----------------------------------------
  // Required Config
  // ----------------------------------------
  // This config cannot be changed by the user.
  debug('Creating required config')
  const appEntryFilename = 'main.js'
  const requiredConfig = {
    compiler_assets: paths.cwdAssets(),
    compiler_favicon: paths.cwdAssets('favicon.png'),
    compiler_dist: paths.cwdDist(),
    compiler_globals: {
      __APP_ENTRY_SRC_PATH__: JSON.stringify(`.${path.sep}${appEntryFilename}`),
      __CWD_SPECS_DIR__: JSON.stringify(paths.cwdSpecs()),
      __CWD_SRC_DIR__: JSON.stringify(paths.cwdSrc()),
      __ENV__: JSON.stringify(__ENV__),
      __DEV__,
      __TEST__,
      __STAG__,
      __PROD__,
      process: {
        env: {
          NODE_ENV: JSON.stringify(NODE_ENV),
        },
      },
    },
    compiler_src: paths.cwdSrc(),
    compiler_fail_on_warning: !__DEV__,
    compiler_autoprefixer: {
      add: true,
      browsers: [
        'last 2 versions',
        'safari >= 8',
        'ie >= 10',
        'ff >= 20',
        'ios 6',
        'android 4',
      ],
    },
    compiler_stats: {
      assets: true,           // assets info
      assetsSort: '',         // (string) sort the assets by that field
      cached: false,          // also info about cached (not built) modules
      chunks: false,          // chunk info
      chunkModules: false,    // built modules info to chunk info
      chunkOrigins: false,    // the origins of chunks and chunk merging info
      chunksSort: '',         // (string) sort the chunks by that field
      colors: true,           // with console colors
      errorDetails: true,     // details to errors (like resolving log)
      hash: false,            // the hash of the compilation
      modules: false,         // built modules info
      modulesSort: '',        // (string) sort the modules by that field
      reasons: false,         // info about the reasons modules are included
      source: false,          // the source code of modules
      timings: true,          // timing info
      version: false,         // webpack version info
    },
    server_protocol: 'http',
    test_entry: paths.genTest('main.test.js'),
    app_entry: paths.cwdSrc(appEntryFilename),
  }
  debug(`Required config = ${JSON.stringify(requiredConfig, null, 2)}`)

  // ----------------------------------------
  // Final Config
  // ----------------------------------------
  debug('Merging final config')
  const finalConfig = Object.assign(
    {},
    defaultConfig,
    projectConfig,
    overrideConfig,
    requiredConfig
  )
  debug(`Final config = ${JSON.stringify(finalConfig, null, 2)}`)
  return finalConfig
}
