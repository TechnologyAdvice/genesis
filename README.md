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

```bash
Usage: gen <command> [options]

Commands:
  build           Build the app
  lint            Lint the project
  start           Start the dev server
  test            Run tests
  validate        Validate the project structure
  help <command>  Display help

Options:
  --version     Show version number                            [boolean]
  -c, --config  Config file path          [default: "genesis.config.js"]
  -h, --help    Show help                                      [boolean]
```

### Node API

The CLI is the primary method of use.  The CLI uses the node API, see `/commands` for Node API usage examples.

## Configuration

Configuration is optional.  To customize Genesis, create any valid config file:

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

## Globals

Genesis compiles your app with some global variables.  Their values are determined by how you set  `NODE_ENV` and `APP_ENV`. See `/lib/context.js` for more.

```
__DEV__
__TEST__
__STAGING__
__PROD__
process.env.NODE_ENV
```

## Releasing

On the latest clean `master`:

```sh
npm run release:major
npm run release:minor
npm run release:patch
```

