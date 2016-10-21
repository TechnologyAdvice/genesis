// ----------------------------------------
// Setup
// ----------------------------------------
import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'
import dirtyChai from 'dirty-chai'
import sinonChai from 'sinon-chai'
import * as enzyme from 'enzyme'

// Enzyme
global.enzyme = enzyme
global.shallow = enzyme.shallow
global.render = enzyme.render
global.mount = enzyme.mount

// Mocha (karma browser global)
mocha.setup({
  ui: 'bdd',
})

// Chai
global.expect = chai.expect
chai.should()
chai.use(chaiEnzyme())
chai.use(dirtyChai)
chai.use(sinonChai)

// ----------------------------------------
// Run
// ----------------------------------------
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
