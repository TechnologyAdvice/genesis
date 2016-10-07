const debug = require('debug')('genesis:context')
const { validateConfig } = require('./validators')
const { log } = require('./utils')

// Mutable context
// This is accessed via the get() / set() methods below
let context = {
  // env: {},          // from the cli invocation
  // config: {},       // the final Genesis config
}

// Environment Helpers
const NODE_ENV = process.env.NODE_ENV || 'development'
const DEPLOY_TARGET = process.env.DEPLOY_TARGET || 'staging'
const __DEV__ = NODE_ENV === 'development'
const __TEST__ = NODE_ENV === 'test'
const __STAGING__ = NODE_ENV === 'production' && DEPLOY_TARGET === 'staging'
const __PROD__ = NODE_ENV === 'production' && DEPLOY_TARGET === 'production'

// This config cannot be changed by the user.
const requiredConfig = {
  compiler_assets: 'src/assets',
  compiler_favicon: 'src/assets/favicon.png',
  compiler_dist: 'dist',
  compiler_globals: {
    __DEV__, __TEST__, __STAGING__, __PROD__,
    process: { env: { NODE_ENV: JSON.stringify(NODE_ENV) } },
  },
  compiler_src: 'src',
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
  test_entry: './test/main.test.js',
}

exports.get = () => {
  debug('Getting context')
  return Object.assign({}, context)
}

exports.set = (newContext) => {
  debug('Setting context')

  // load and update config
  let projectConfig = {}
  if (newContext.env && newContext.env.configPath) {
    debug('Trying to load config')
    try {
      projectConfig = require(newContext.env.configPath)
      debug('Config loaded')
    } catch (err) {
      debug('Config load failed')
      log.error('Could not load config.', err)
    }

    debug('Validating config')
    validateConfig(projectConfig)
  }

  context = Object.assign({}, context, newContext, {
    config: Object.assign(
      {},
      require('./default-config'),
      projectConfig,
      requiredConfig
    ),
  })
}
