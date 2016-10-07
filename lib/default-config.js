module.exports = {
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
   * @property {boolean} compiler_devtool - the developer tool to be generated with the compiled code.
   */
  compiler_devtool: true,

  /**
   * @property {Object} compiler_externals - a hash map of modules to treat
   * as external (i.e. not bundled, but available on the global scope). Each
   * key is the module name and the value is the variable name on the global
   * scope.
   * NOTE: these are not used during testing.
   */
  compiler_externals: {},

  /**
   * @property {Object} compiler_globals - a hash map where the keys is
   * the variable name to expose as a global during compilation and the
   * value is the value to assign to that variable.
   * NOTE: process.env.NODE_ENV, __DEV__, __TEST__, and __PROD__ are
   * always automatically provided by genesis if they are not defined.
   */
  compiler_globals: {},

  /**
   * @property {Array<string|RegExp>} compiler_noParse - an array of patterns that,
   * when matched, tell the compiler not to parse the module contents but
   * simply include them in the bundle.
   */
  compiler_noParse: [],

  /**
   * @property {Array<string>} compiler_vendors - an array of module names to
   * bundle separately from the core application code. These are generally
   * 3rd-party dependencies that mostly remain static.
   */
  compiler_vendors: [],
}
