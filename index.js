'use strict';

exports.server = {
  dev: require('./lib/dev-server'),
}

exports.karma = {
  config: require('./lib/karma-config'),
}

exports.webpack = {
  config: require('./lib/webpack-config'),
}
