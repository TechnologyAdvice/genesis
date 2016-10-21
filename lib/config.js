const cliEnv = require('./cliEnv').get()
const debug = require('debug')('genesis:genesisConfig')
const { validateConfig } = require('./validators')
const log = require('./log')
const paths = require('./paths')

// ----------------------------------------
// Load project config
// ----------------------------------------
let projectConfig
if (cliEnv.configPath) {
  debug(`Trying to load config ${cliEnv.configPath}`)
  try {
    projectConfig = require(cliEnv.configPath)
    debug('Config loaded')
  } catch (err) {
    debug('Config load failed')
    log.error('Could not load config.', err)
  }

  debug('Validating config')
  validateConfig(projectConfig)
}

// ----------------------------------------
// Environment Helpers
// ----------------------------------------
const NODE_ENV = process.env.NODE_ENV || 'development'
const APP_ENV = process.env.APP_ENV || 'development'
const __DEV__ = NODE_ENV === 'development'
const __TEST__ = NODE_ENV === 'test'
const __STAGING__ = NODE_ENV === 'production' && APP_ENV === 'staging'
const __PROD__ = NODE_ENV === 'production' && APP_ENV === 'production'

// ----------------------------------------
// Required Config
// ----------------------------------------
// This config cannot be changed by the user.
const requiredConfig = {
  compiler_assets: paths.cwdAssets(),
  compiler_favicon: paths.cwdAssets('favicon.png'),
  compiler_dist: paths.cwdDist(),
  compiler_globals: {
    __CWD_SPECS_DIR__: JSON.stringify(paths.cwdSpecs()),
    __DEV__,
    __TEST__,
    __STAGING__,
    __PROD__,
    process: { env: { NODE_ENV: JSON.stringify(NODE_ENV) } },
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

// ----------------------------------------
// Final Config
// ----------------------------------------
module.exports = Object.assign(
  {},
  require('./default-config'),
  projectConfig,
  requiredConfig
)
