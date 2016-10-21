const test = require('../../../bin/test')

describe('bin/test.js', () => {
  it('is a function', () => {
    test.should.be.a('function')
  })

  it('throws if it is not passed an options object', () => {
    const badTypes = [undefined, null, true, 0, '', []]

    return Promise.all(badTypes.map(type => {
      return test(type)
        .should.be.rejectedWith(Error, `You must pass an options object, received \`${typeof type}\`.`)
    }))
  })

  it('throws if options does not have a `configFile` key', () => {
    return test({}).should.be.rejectedWith(Error, 'options.configFile must be a string.')
  })

  // TODO: test the success case, mock Karma?
})
