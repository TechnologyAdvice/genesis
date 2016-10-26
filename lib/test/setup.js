import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import chaiEnzyme from 'chai-enzyme'
import dirtyChai from 'dirty-chai'
import sinonChai from 'sinon-chai'
import * as enzyme from 'enzyme'
import sandbox from './sandbox'

// Enzyme
global.enzyme = enzyme
global.shallow = enzyme.shallow
global.render = enzyme.render
global.mount = enzyme.mount

// Mocha (karma browser global)
mocha.setup({
  ui: 'bdd',
})

// Sinon
global.sandbox = sandbox

// Chai
global.expect = chai.expect
chai.should()
chai.use(chaiAsPromised)
chai.use(chaiEnzyme())
chai.use(dirtyChai)
chai.use(sinonChai)
