const chalk = require('chalk')
const circularJSON = require('circular-json')
const figures = require('figures')
const _ = require('lodash/fp')

// ----------------------------------------
// Stream writer
// ----------------------------------------
const print = (stream, color, symbol, ...msgs) => {
  const formattedMessages = msgs.map(msg => {
    // pretty print objects with circular support
    return {}.toString.call(msg) === '[object Object]'
      ? circularJSON.stringify(msg, null, 2)
      : msg
  })

  const line = `${color(symbol)} ${formattedMessages.join('')}`
  return process[stream].write(line)
}

// ----------------------------------------
// Logger
// ----------------------------------------
const log = (...msgs) => print('stdout', chalk.white.dim, ' ', ...msgs, '\n')
log.error = (...msgs) => print('stderr', chalk.red, figures.cross, ...msgs, '\n')
log.warn = (...msgs) => print('stderr', chalk.yellow, figures.warning, ...msgs, '\n')
log.info = (...msgs) => print('stdout', chalk.blue, figures.info, chalk.gray(msgs), '\n')
log.success = (...msgs) => print('stdout', chalk.green, figures.tick, ...msgs, '\n')

// alias to allow log[level]('message') usage
log.log = log

// ----------------------------------------
// Spinner
// ----------------------------------------
let spinMessages = []
let isSpinning = false
let spinTimer

const spinClear = () => {
  process.stdout.clearLine()
  process.stdout.cursorTo(0)
}
log.spinStopAndClear = () => {
  isSpinning = false
  clearTimeout(spinTimer)
  spinClear()
}
log.spin = (...msgs) => {
  const frames = ['⠦', '⠇', '⠋', '⠙', '⠸', '⠴']
  let frame = frames[0]
  isSpinning = true
  spinMessages = msgs

  const renderNextFrame = () => {
    spinClear()
    print('stdout', chalk.cyan, frame, ...msgs)

    if (isSpinning) {
      frame = frames[frames.indexOf(frame) + 1] || frames[0]
      spinTimer = setTimeout(renderNextFrame, 80)
    }
  }

  renderNextFrame()
}
log.spinSucceed = (...msgs) => {
  log.spinStopAndClear()
  const args = (_.isEmpty(msgs) ? spinMessages : msgs)
  log.success(...args)
}
log.spinFail = (...msgs) => {
  log.spinStopAndClear()
  const args = (_.isEmpty(msgs) ? spinMessages : msgs)
  log.error(...args)
}

module.exports = log
