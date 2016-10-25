const chalk = require('chalk')
const debug = require('debug')('genesis:get-config')
const validators = require('./validators')
const log = require('./log')
const paths = require('./paths')

/**
 * Get the configuration for this run.
 * @param {object} [options={}] - Additional options.
 * @param {string} [options.defaultEnv=development] - The default environment to use if none were specified.
 * @returns {object} Final configuration.
 */
module.exports = function getConfig(options = { defaultEnv: 'development' }) {
  debug('Get config')
  const { argv } = require('yargs')
  const { defaultEnv } = options

  // ----------------------------------------
  // Default Config
  // ----------------------------------------
  const defaultConfig = require('./default-config')

  // ----------------------------------------
  // Project Config
  // ----------------------------------------
  let projectConfig

  if (!argv.config) {
    debug('No config specified')
  } else {
    debug(`Trying to load config ${argv.config}`)

    try {
      projectConfig = require(argv.config)
      debug('Config loaded')
      log.info(`Loaded config ${chalk.magenta(argv.config)}`)

      validators.projectConfig(projectConfig)
    } catch (err) {
      debug('Config load failed')
      err.message = `Could not load config. ${err.message}`
      throw err
    }
  }

  // ----------------------------------------
  // Environment
  // ----------------------------------------
  debug('Setting environment globals')

  const __ENV__ = argv.env || process.env.NODE_ENV || defaultEnv
  const __DEV__ = __ENV__ === 'development'
  const __TEST__ = __ENV__ === 'test'
  const __STAG__ = __ENV__ === 'staging'
  const __PROD__ = __ENV__ === 'production'
  const NODE_ENV = process.env.NODE_ENV || __ENV__

  if (!argv.env) log.info(`Setting default --env ${__ENV__}`)
  if (!process.env.NODE_ENV) log.info(`Setting default NODE_ENV=${NODE_ENV}`)

  // ----------------------------------------
  // Required Config
  // ----------------------------------------
  // This config cannot be changed by the user.
  const requiredConfig = {
    env: __ENV__,
    compiler_assets: paths.cwdAssets(),
    compiler_favicon: paths.cwdAssets('favicon.png'),
    compiler_dist: paths.cwdDist(),
    compiler_globals: {
      __CWD_SPECS_DIR__: JSON.stringify(paths.cwdSpecs()),
      __ENV__,
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
  }

  debug(`Required config ${JSON.stringify(requiredConfig, null, 2)}`)

  // ----------------------------------------
  // Final Config
  // ----------------------------------------
  const finalConfig = Object.assign(
    {},
    defaultConfig,
    projectConfig,
    requiredConfig
  )
  debug(`Final config ${JSON.stringify(finalConfig, null, 2)}`)
  return finalConfig
}
