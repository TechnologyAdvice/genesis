/**
 * File system path helpers
 */
const debug = require('debug')('genesis:paths')
const path = require('path')
const { argv } = require('yargs')

// ----------------------------------------
// Genesis paths
// ----------------------------------------
const GENESIS_ROOT = path.resolve(__dirname, '..')
const GENESIS_BIN = path.resolve(GENESIS_ROOT, 'bin')
const GENESIS_LIB = path.resolve(GENESIS_ROOT, 'lib')
const GENESIS_TEST = path.resolve(GENESIS_LIB, 'test')

exports.genRoot = (...p) => path.resolve(GENESIS_ROOT, ...p)
exports.genBin = (...p) => path.resolve(GENESIS_BIN, ...p)
exports.genLib = (...p) => path.resolve(GENESIS_LIB, ...p)
exports.genTest = (...p) => path.resolve(GENESIS_TEST, ...p)

// ----------------------------------------
// Paths from the --cwd of the CLI invocation
// ----------------------------------------
// See https://github.com/js-cli/js-liftoff#optscwd
const CWD_ROOT = path.resolve(process.cwd(), argv.cwd)
const CWD_SRC = path.resolve(CWD_ROOT, 'src')
const CWD_ASSETS = path.resolve(CWD_SRC, 'assets')
const CWD_DIST = path.resolve(CWD_ROOT, 'dist')
const CWD_TEST = path.resolve(CWD_ROOT, 'test')
const CWD_SPECS = path.resolve(CWD_TEST, 'specs')

exports.cwdRoot = (...p) => path.resolve(CWD_ROOT, ...p)
exports.cwdSrc = (...p) => path.resolve(CWD_SRC, ...p)
exports.cwdAssets = (...p) => path.resolve(CWD_ASSETS, ...p)
exports.cwdDist = (...p) => path.resolve(CWD_DIST, ...p)
exports.cwdTest = (...p) => path.resolve(CWD_TEST, ...p)
exports.cwdSpecs = (...p) => path.resolve(CWD_SPECS, ...p)

// ----------------------------------------
// Debug
// ----------------------------------------
debug('Genesis paths:')
debug(`  GENESIS_ROOT - ${GENESIS_ROOT}`)
debug(`  GENESIS_BIN  - ${GENESIS_BIN}`)
debug(`  GENESIS_LIB  - ${GENESIS_LIB}`)
debug(`  GENESIS_TEST - ${GENESIS_TEST}`)
debug(`  genRoot()    - ${exports.genRoot()}`)
debug(`  genBin()     - ${exports.genBin()}`)
debug(`  genLib()     - ${exports.genLib()}`)
debug(`  genTest()    - ${exports.genTest()}`)
debug('Paths from --cwd:')
debug(`  CWD_ROOT     - ${CWD_ROOT}`)
debug(`  CWD_SRC      - ${CWD_SRC}`)
debug(`  CWD_ASSETS   - ${CWD_ASSETS}`)
debug(`  CWD_DIST     - ${CWD_DIST}`)
debug(`  CWD_TEST     - ${CWD_TEST}`)
debug(`  CWD_SPECS    - ${CWD_SPECS}`)
debug(`  cwdRoot()    - ${exports.cwdRoot()}`)
debug(`  cwdSrc()     - ${exports.cwdSrc()}`)
debug(`  cwdDist()    - ${exports.cwdDist()}`)
debug(`  cwdTest()    - ${exports.cwdTest()}`)
debug(`  cwdSpecs()   - ${exports.cwdSpecs()}`)
debug(`  cwdAssets()  - ${exports.cwdAssets()}`)
