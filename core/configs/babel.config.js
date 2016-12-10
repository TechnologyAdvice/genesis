const debug = require('debug')('genesis:config:babel')

/**
 * Returns a babel config.
 *
 * @param {object} config - A valid Genesis config object
 * @param {object} [options={}] - High level configuration options.
 * @param {boolean} [options.coverage=false] - Whether or not to add coverage plugins.
 * @returns {{}} - A valid Babel config.
 */
module.exports = (config, options = {}) => {
  debug('With options:', JSON.stringify(options))

  const { coverage = false } = options

  // ----------------------------------------
  // Base
  // ----------------------------------------
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

  // ----------------------------------------
  // Coverage
  // ----------------------------------------
  if (coverage) {
    babelConfig.plugins.push(['__coverage__', { only: config.compiler_src }])
  }

  debug('Final babel config =', JSON.stringify(babelConfig, null, 2))

  return babelConfig
}
