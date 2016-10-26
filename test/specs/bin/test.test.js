const test = require('../../../bin/test')

describe('bin/test.js', () => {
  it('is a function', () => {
    test.should.be.a('function')
  })

  it('throws if it is not passed an options object', () => {
    const badTypes = [undefined, null, true, 0, '', []]

    return Promise.all(badTypes.map(type => {
      return test(type)
        .should.be.rejectedWith(Error, `You must pass a karmaConfig object, received \`${typeof type}\``)
    }))
  })
})
