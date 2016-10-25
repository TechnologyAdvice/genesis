# Genesis
[![Circle CI](https://img.shields.io/circleci/project/TechnologyAdvice/genesis/master.svg?style=flat-square)](https://circleci.com/gh/TechnologyAdvice/genesis/tree/master)
[![Codecov](https://img.shields.io/codecov/c/github/TechnologyAdvice/genesis/master.svg?style=flat-square)](https://codecov.io/gh/TechnologyAdvice/genesis)

## Table of Contents
1. [Requirements](#requirements)
1. [Installation](#installation)
1. [Usage](#usage)
1. [Configuration](#configuration)

## Requirements

* node `^6.0.0`
* npm `^3.0.0`

## Installation

```bash
npm i --save @technologyadvice/genesis
```

## Usage

### CLI

Use the CLI for sub command usage, example `gen help <command>`.

```
Usage: cli.js <command> [options]

Commands:
  build       build the app
  lint        lint the project
  start       start the dev server
  test        run tests
  validate    validate the project structure
  completion  generate bash completion script

Options:
  --help         Show help                                            [boolean]
  -c, --config   Config file path                                      [string]
  --env          Set app environment globals
             [string] [choices: "development", "production", "staging", "test"]
  --cwd          Change the current working directory            [default: "."]
  -v, --version  Show version number                                  [boolean]
```

### Node API

The CLI is the primary method of use.  The CLI uses the node API, see `/commands` for Node API usage examples.

## Configuration (optional)

Create any valid config file.  The CLI will search up through directories to find a config file:

- `genesis.config.js`
- `genesis.js`
- `.genesisrc` 

>You can also use `.json`, `.yml`, `.babel.js`, or any other extension supported by [js-interpret](https://github.com/js-cli/js-interpret).

Your config should define an object with these keys.  See `/lib/default-config.js` for more info:

```js
module.exports = {
  server_host: 'localhost',
  server_port: 3000,

  compiler_alias: {},
  compiler_externals: {},
  compiler_globals: {},
  compiler_noParse: [],
  compiler_vendors: [],
}
```

## Environment 

Set either `--env` or `NODE_ENV`. Each defaults to the other if not set.  Each command has 

### Globals

Genesis makes the following globals available in your code.

|Global                   | Description                                                   |
|-------------------------|---------------------------------------------------------------|
|`__ENV__`                | Set with `--env`.  Defaults to `NODE_ENV` else `development`. |
|`__DEV__`                | `true` when `__ENV__ === 'development'`                       |
|`__TEST__`               | `true` when `__ENV__ === 'test'`                              |
|`__STAG__`               | `true` when `__ENV__ === 'production'`                        |
|`__PROD__`               | `true` when `__ENV__ === 'production'`                        |
|`process.env.NODE_ENV`   | Set with `NODE_ENV`.  Defaults to `--env`.                    |

>Note, `process.env.NODE_ENV` is only defaulted as a global variable in your app.  Genesis never sets or changes actual environment variables.

### Multiple Environments

React uses `NODE_ENV` to flip features such as prop type warnings.  In our experience, you sometimes need to set `NODE_ENV` to one value only for React, but you require a different value for your app code.

Genesis allows setting `--env` and `NODE_ENV` independently.  

### `--env`

Sets the _global_ `process.env.NODE_ENV` for use in your code.  It **does not** set the `NODE_ENV` environment variable.


## Releasing

On the latest clean `master`:

```sh
npm run release:major
npm run release:minor
npm run release:patch
```

