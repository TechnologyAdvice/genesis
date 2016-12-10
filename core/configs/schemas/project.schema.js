module.exports = {
  // ======================================================
  // Server Options
  // ======================================================
  server_host: {
    default: 'localhost',
    type: 'string',
    describe: 'The hostname for the app server',
  },

  server_port: {
    default: 3000,
    type: 'number',
    describe: 'The port for the app server',
  },

  // ======================================================
  // Compiler Options
  // ======================================================

  compiler_alias: {
    default: {},
    type: 'object',
    describe: [
      'A hash map of modules to alias.',
      'Each key should define the original module name and its value should',
      'be the module or full path name that you wish to actually provide',
      'to the importer.',
    ].join(' '),
  },

  compiler_env: {
    default: null,
    type: 'string',
    describe: [
      'The environment to compile the app in.  This sets all environment globals.',
      'This can be set independent of NODE_ENV. The default is determined by each command.',
    ].join(' '),
  },

  compiler_externals: {
    default: {},
    type: 'object',
    describe: [
      'A hash map of modules to treat',
      'as external (i.e. not bundled, but available on the global scope). Each',
      'key is the module name and the value is the variable name on the global',
      'scope.',
      '\nNOTE: these are not used during testing.',
    ].join(' '),
  },

  compiler_globals: {
    default: {},
    type: 'object',
    describe: [
      'A hash map where the keys is',
      'the variable name to expose as a global during compilation and the',
      'value is the value to assign to that variable.',
    ].join(' '),
  },

  compiler_noParse: {
    default: [],
    type: 'array',
    describe: [
      'An array of patterns that',
      'when matched, tell the compiler not to parse the module contents but',
      'simply include them in the bundle.',
    ].join(' '),
  },

  compiler_sourcemaps: {
    default: true,
    type: 'boolean',
    describe: 'Whether to generate sourcemaps or not',
  },

  compiler_vendors: {
    default: [],
    type: 'array',
    describe: [
      'An array of module names to',
      'bundle separately from the core application code. These are generally',
      '3rd-party dependencies that mostly remain static.',
    ].join(' '),
  },
}
