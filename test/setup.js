const chai = require('chai')

global.expect = chai.expect
chai.should()
chai.use(require('chai-as-promised'))
chai.use(require('dirty-chai'))
chai.use(require('sinon-chai'))
