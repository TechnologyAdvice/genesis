const chalk = require('chalk')
const circularJSON = require('circular-json')
const figures = require('figures')

const print = (stream, color, symbol, ...msgs) => {
  const formattedMessages = msgs
    .map(msg => {
      // pretty print objects with circular support
      return {}.toString.call(msg) === '[object Object]'
        ? circularJSON.stringify(msg, null, 2)
        : msg
    })

  console[stream](color(`${symbol} Genesis`), ...formattedMessages) // eslint-disable-line no-console
}

const log = (...msgs) => print('log', chalk.white.dim, '-', ...msgs)
log.error = (...msgs) => print('error', chalk.red, figures.cross, ...msgs)
log.warning = (...msgs) => print('error', chalk.yellow, figures.warning, ...msgs)
log.info = (...msgs) => print('log', chalk.cyan, figures.info, ...msgs)
log.success = (...msgs) => print('log', chalk.green, figures.tick, ...msgs)

module.exports = log
