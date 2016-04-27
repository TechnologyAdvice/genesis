'use strict';

module.exports = {
  __do_not_change_or_you_will_be_fired__: {
    cacheDirectory: true,
    plugins: [
      'add-module-exports',
      'transform-runtime',
      'transform-decorators-legacy',
    ],
    presets: ['es2015', 'react', 'stage-1'],
    env: {
      development: {
        plugins: [
          ['react-transform', {
            transforms: [{
              transform: 'react-transform-hmr',
              imports: ['react'],
              locals: ['module'],
            }, {
              transform: 'react-transform-catch-errors',
              imports: ['react', 'redbox-react'],
            }],
          }],
        ],
      },
    },
  },
}
