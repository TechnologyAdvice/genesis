import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import chaiEnzyme from 'chai-enzyme'
import dirtyChai from 'dirty-chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import * as enzyme from 'enzyme'

// Enzyme
// ------------------------------------
global.enzyme = enzyme
global.shallow = enzyme.shallow
global.render = enzyme.render
global.mount = enzyme.mount

// Mocha (karma browser global)
// ------------------------------------
mocha.setup({
  ui: 'bdd',
})

// Sinon
// ------------------------------------
global.sinon = sinon
global.sandbox = sinon.sandbox.create()

afterEach(() => global.sandbox.restore())

// Chai
// ------------------------------------
global.expect = chai.expect
chai.should()
chai.use(chaiAsPromised)
chai.use(chaiEnzyme())
chai.use(dirtyChai)
chai.use(sinonChai)
