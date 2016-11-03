import 'babel-polyfill'
import './setup'

// Execute all sources coverage is generated, whether or not there are tests for them.
const srcContext = require.context(__CWD_SRC_DIR__, true, /\.js$/)
srcContext
  .keys()
  // Do not execute the app entry
  .filter(path => path !== __APP_ENTRY_SRC_PATH__)
  .forEach(srcContext)

// Heads Up!
// We use a Webpack global here as it is replaced with a string during compile.
// Using a regular JS variable is not statically analyzable so webpack will throw warnings.
const testsContext = require.context(__CWD_SPECS_DIR__, true, /\.test\.js$/)

// only re-run changed tests, or all if none changed
// https://www.npmjs.com/package/karma-webpack-with-fast-source-maps
const __karmaWebpackManifest__ = []
let runnable = testsContext.keys().filter((path) => __karmaWebpackManifest__.indexOf(path) >= 0)

if (!runnable.length) runnable = testsContext.keys()

runnable.forEach(testsContext)
