module.exports = () => ({
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
})
