# Genesis

## Table of Contents
1. [Requirements](#requirements)
1. [Installation](#installation)
1. [Usage](#usage)
1. [Configuration](#configuration)

## Requirements

* node `^5.0.0`
* npm `^3.0.0`

## Installation

```bash
npm i --save @technologyadvice/genesis
```

## Usage

TBD

## Configuration

```js
  // ======================================================
  // Compiler Options
  // ======================================================
  /**
   * @property {Object} compiler_alias - a hash map of modules to alias.
   * Each key should define the original module name and its value should
   * be the module or full path name that you wish to actually provide
   * to the importer.
   */
  compiler_alias: {},

  /**
   * @property {?string} compiler_devtool - the developer tool to be generated
   * with the compiled code.
   */
  compiler_devtool: process.env.NODE_ENV !== 'production' ? 'source-map' : false,

  /**
   * @property {string} compiler_src - the name of the destination directory for
   * the client application (relative to process.cwd() [the root of the application])
   */
  compiler_dist: 'dist',

  /**
   * @property {Object} compiler_externals - a hash map of modules to treat
   * as external (i.e. not bundled, but provided in the global scope). Each
   * key is the module name and the value is the variable name on the global
   * scope.
   * NOTE: these are not used during testing.
   */
  compiler_externals: {},

  /**
   * @property {string} compiler_favicon - absolute path to the favicon file
   * to use in the generated html template.
   */
  compiler_favicon: null,

  /**
   * @property {Object} compiler_globals - a hash map where the keys is
   * the variable name to expose as a global during compilation and the
   * value is the value to assign to that variable.
   * NOTE: process.env.NODE_ENV, __DEV__, __TEST__, and __PROD__ are
   * always automatically provided by the generated webpack coonfig.
   */
  compiler_globals: {},

  /**
   * @property {boolean} compiler_lint - whether or not the compiler should
   * lint the application code as part of the build process. This option exists
   * because eslint-loader is notoriously heavy, so if linting is performed
   * separately then the compiler does not need to be responsible for it.
   */
  compiler_lint: true,

  /**
   * @property {Array<string|RegExp>} compiler_noParse - an array of patterns that,
   * when matched, tell the compiler not to parse the module contents but
   * simply include them in the bundle.
   */
  compiler_noParse: [],

  /**
   * @property {string} compiler_src - the name of the source directory for the
   * client application (relative to process.cwd() [the root of the application]).
   */
  compiler_src: 'src',

  /**
   * @property {Object} compiler_stats - the configuration object provided to
   * webpack to customize what information is displayed after a bundle.
   */
  compiler_stats: {
    chunks: false,
    chunkModules: false,
    colors: true,
    modules: false,
  },

  /**
   * @property {Array<string>} compiler_vendors - an array of module names to
   * bundle separately from the core application code. These are generally
   * 3rd-party dependencies that mostly remain static.
   */
  compiler_vendors: [],

  // ======================================================
  // Server Options
  // ======================================================
  /**
   * @property {string} server_host - the hostname for the app server
   */
  server_host: 'localhost',

  /**
  * @property {number} server_port - the port for the app server
  */
  server_port: 3000,

  /**
  * @property {string} server_protocol - the protocol for the app server
  */
  server_protocol: 'http',

  // ======================================================
  // Testing Options
  // ======================================================
  /**
   * @property {Array<Object>} test_coverage_reporters - the reporters
   * to use when coverage is enabled.
   */
  test_coverage_reporters: [
    { type: 'text-summary' },
    { type: 'lcov', dir: 'coverage' },
  ],

  /**
   * @property {boolean|Function} test_enable_coverage - whether or not
   * to instrument the application for coverage reporting. If a function
   * is supplied, it will be invoked and its return value will be used
   * (and therefore should return a boolean value).
   */
  test_enable_coverage: () => {
    return true
  },

  /**
   * @property {string} test_entry - the entry point for the test bundler.
   * This path is relative to process.cwd.
   */
  test_entry: './test/test-bundler.js',

  /**
   * @property {boolean} test_watch - whether or not to run the tests in
   * watch mode.
   */
  test_watch: !!argv.watch,
}
```