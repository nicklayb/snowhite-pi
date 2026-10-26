const Gpio = require('./gpio.js')
const State = require('./state.js')
const { inverse } = require('./utils.js')

const PIR_PIN = 17
const RELAY_PIN = 27

const INVERTED = true
let running = false

const convertValue = (value) => INVERTED ? inverse(value) : value

const init = () => {
  if (running) return;

  const Relay = Gpio.createOutput(RELAY_PIN)

  State.onUpdate((value) => {
    Relay.write(convertValue(value))
    console.log(`[RELAY] Switching to ${value}`)
  })

  if (!process.argv.includes('--no-pir')) {
    console.log(`[PIR] Watching for changes...`)
    Gpio.watchInput(PIR_PIN, (value) => {
      console.log(`[PIR] Updated to state ${value}`)

      if (State.getState() !== value) {
        State.update(value)
      }
    })
  }
  running = true
}

module.exports = {
  init
}
