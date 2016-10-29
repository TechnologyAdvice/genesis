const debug = require('debug')('genesis:get-babel-config')
module.exports = () => {
  const babelConfig = {
    cacheDirectory: true,
    plugins: [
      'lodash',
      'transform-react-constant-elements',
      ['transform-react-remove-prop-types', {
        mode: 'wrap',
      }],
      ['transform-runtime', {
        polyfill: false,
        regenerator: false,
      }],
    ],
    presets: ['es2015', 'react', 'stage-1'],
  }

  debug('Final babel config =', JSON.stringify(babelConfig, null, 2))

  return babelConfig
}
