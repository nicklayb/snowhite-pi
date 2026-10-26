const { spawn } = require('child_process')
const readline = require('readline')

const CHIP = process.env.GPIO_CHIP || 'gpiochip0'
const RISING_EDGE = '1'
const FAILURE_EXIT_CODE = 1

const log = (message, type = 'log') => console[type](`[GPIO] ${message}`)

const exitOnUnexpectedExit = (command) => (code, signal) => {
  log(`${command} exited unexpectedly (code: ${code}, signal: ${signal})`, 'error')
  process.exit(FAILURE_EXIT_CODE)
}

/**
 * Watches both edges of an input line with libgpiod's `gpiomon`
 * and calls `onChange` with 1 (rising) or 0 (falling).
 */
const watchInput = (line, onChange) => {
  const monitor = spawn(
    'gpiomon',
    ['--chip', CHIP, '--edges', 'both', '--format', '%e', `${line}`],
    { stdio: ['ignore', 'pipe', 'inherit'] }
  )
  monitor.on('exit', exitOnUnexpectedExit('gpiomon'))

  readline
    .createInterface({ input: monitor.stdout })
    .on('line', (edge) => onChange(edge.trim() === RISING_EDGE ? 1 : 0))
}

/**
 * Drives an output line with libgpiod's `gpioset`, which only holds a value while running.
 * Each new value restarts `gpioset` once the previous process has released the line.
 * Returns `{ write(value) }`.
 */
const createOutput = (line, initialValue = 0) => {
  let value = initialValue
  let holdingProcess = null
  let isReleasing = false

  const hold = () => {
    holdingProcess = spawn(
      'gpioset',
      ['--chip', CHIP, `${line}=${value}`],
      { stdio: ['ignore', 'ignore', 'inherit'] }
    )
    holdingProcess.once('exit', exitOnUnexpectedExit('gpioset'))
  }

  const write = (newValue) => {
    if (newValue === value) return

    value = newValue
    if (isReleasing) return

    isReleasing = true
    holdingProcess.removeAllListeners('exit')
    holdingProcess.once('exit', () => {
      isReleasing = false
      hold()
    })
    holdingProcess.kill()
  }

  hold()

  return { write }
}

module.exports = {
  watchInput,
  createOutput
}
