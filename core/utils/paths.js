/**
 * File system path helpers
 */
const debug = require('debug')('genesis:utils:paths')
const path = require('path')
const { argv } = require('yargs')

// ----------------------------------------
// Genesis paths
// ----------------------------------------
const GENESIS_ROOT = path.resolve(__dirname, '..', '..')

exports.genRoot = (...p) => path.resolve(GENESIS_ROOT, ...p)
exports.genBin = (...p) => exports.genRoot('bin', ...p)
exports.genCore = (...p) = exports.genRoot('core', ...p)
exports.genTest = (...p) => exports.genCore('test', ...p)

// ----------------------------------------
// Paths from the --cwd of the CLI invocation
// ----------------------------------------
// See https://github.com/js-cli/js-liftoff#optscwd
const CWD_ROOT = path.resolve(process.cwd(), argv.cwd)

exports.cwdRoot = (...p) => path.resolve(CWD_ROOT, ...p)
exports.cwdSrc = (...p) => exports.cwdRoot('src', ...p)
exports.cwdAssets = (...p) => exports.cwdSrc('assets', ...p)
exports.cwdDist = (...p) => exports.cwdRoot('dist', ...p)
exports.cwdTest = (...p) => exports.cwdRoot('test', ...p)
exports.cwdMocks = (...p) => exports.cwdTest('mocks', ...p)
exports.cwdSpecs = (...p) => exports.cwdTest('specs', ...p)

// ----------------------------------------
// Debug
// ----------------------------------------
debug('Genesis paths:')
debug(`  GENESIS_ROOT - ${exports.genRoot()}`)
debug(`  GENESIS_BIN  - ${exports.genBin()}`)
debug(`  GENESIS_CORE - ${exports.genCore()}`)
debug(`  GENESIS_TEST - ${exports.genTest()}`)
debug('Paths from --cwd:')
debug(`  CWD_ROOT     - ${exports.cwdRoot()}`)
debug(`  CWD_SRC      - ${exports.cwdSrc()}`)
debug(`  CWD_ASSETS   - ${exports.cwdAssets()}`)
debug(`  CWD_DIST     - ${exports.cwdDist()}`)
debug(`  CWD_TEST     - ${exports.cwdTest()}`)
debug(`  CWD_SPECS    - ${exports.cwdSpecs()}`)
