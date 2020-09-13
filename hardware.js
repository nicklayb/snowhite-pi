const { Gpio } = require('onoff')
const State = require('./state.js')
const { inverse } = require('./utils.js')

const PIR_PIN = 17
const RELAY_PIN = 27

const Pir = new Gpio(PIR_PIN, 'in', 'both')
const Relay = new Gpio(RELAY_PIN, 'out')

const INVERTED = true
let running = false

const convertValue = (value) => INVERTED ? inverse(value) : value

const init = () => {
  if (running) return;

  State.onUpdate((value) => {
    Relay.writeSync(convertValue(value))
    console.log(`[RELAY] Switching to ${value}`)
  })

  if (!process.argv.includes('--no-pir')) {
    console.log(`[PIR] Watching for changes...`)
    Pir.watch((err, value) => {
      console.log(`[PIR] Updated to state ${value}`)
      if (err) console.error({ err })

      if (State.getState() !== value) {
        State.update(value)
      }
    })
  }
  running = true
}

module.exports = {
  init,
  Pir,
  Relay
}
