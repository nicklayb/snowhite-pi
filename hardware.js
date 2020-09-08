const { Gpio } = require('onoff')
const State = require('./state.js')

const PIR_PIN = 17
const RELAY_PIN = 27

const Pir = new Gpio(PIR_PIN, 'in', 'both')
const Relay = new Gpio(RELAY_PIN, 'out')

const init = () => {
	console.log(`[PIR] Watching for changes...`)
	State.onUpdate((value) => {
		Relay.writeSync(value)
		console.log(`[RELAY] Switching to ${value}`)
	})

	Pir.watch((err, value) => {
		console.log(`[PIR] Updated to state ${value}`)
		if (err) console.error({ err })

		if (State.getState() !== value) {
			State.update(value)
		}
	})
}

module.exports = {
	init,
	Pir,
	Relay
}
