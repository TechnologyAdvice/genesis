const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const chaiEnzyme = require('chai-enzyme')
const dirtyChai = require('dirty-chai')
const sinonChai = require('sinon-chai')
const enzyme = require('enzyme')

// Enzyme
global.enzyme = enzyme
global.shallow = enzyme.shallow
global.render = enzyme.render
global.mount = enzyme.mount

// Chai
global.expect = chai.expect
chai.should()
chai.use(chaiAsPromised)
chai.use(chaiEnzyme())
chai.use(dirtyChai)
chai.use(sinonChai)

